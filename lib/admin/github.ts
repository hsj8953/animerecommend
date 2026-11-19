import 'server-only'

import { AdminError, githubApiUrl, githubBranch, githubRepo, requireEnv } from '@/lib/admin/env'

// GitHub API 로 레포 파일을 읽고, 여러 파일을 한 번의 커밋으로 올린다.
// 커밋되면 Vercel 이 자동으로 다시 배포한다.

async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${githubApiUrl()}/repos/${githubRepo()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireEnv('GITHUB_TOKEN')}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    if (res.status === 401) {
      throw new AdminError('GitHub 토큰이 잘못됐거나 만료됐어요. GITHUB_TOKEN 을 확인해 주세요.', 500)
    }
    if (res.status === 403 || res.status === 404) {
      throw new AdminError(
        `GitHub 레포(${githubRepo()})에 접근할 수 없어요. 토큰에 이 레포의 Contents 읽기/쓰기 권한이 있는지 확인해 주세요.`,
        500,
      )
    }
    const err = new AdminError(`GitHub 오류 ${res.status}: ${text.slice(0, 200)}`, 502)
    ;(err as AdminError & { ghStatus: number }).ghStatus = res.status
    throw err
  }
  return res.json() as Promise<T>
}

export async function getHead() {
  const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${githubBranch()}`)
  const commit = await gh<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`)
  return { commitSha: ref.object.sha, treeSha: commit.tree.sha }
}

export async function readJsonFile<T>(path: string, ref: string): Promise<T> {
  const file = await gh<{ content: string; encoding: string }>(
    `/contents/${encodeURI(path)}?ref=${ref}`,
  )
  const text = Buffer.from(file.content, 'base64').toString('utf8')
  return JSON.parse(text) as T
}

export type FileChange =
  | { path: string; text: string }
  | { path: string; base64: string }
  | { path: string; delete: true }

export async function commitFiles(
  head: { commitSha: string; treeSha: string },
  changes: FileChange[],
  message: string,
) {
  const tree = await Promise.all(
    changes.map(async (c) => {
      if ('delete' in c) return { path: c.path, mode: '100644', type: 'blob', sha: null }
      if ('text' in c) return { path: c.path, mode: '100644', type: 'blob', content: c.text }
      const blob = await gh<{ sha: string }>('/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: c.base64, encoding: 'base64' }),
      })
      return { path: c.path, mode: '100644', type: 'blob', sha: blob.sha }
    }),
  )

  const newTree = await gh<{ sha: string }>('/git/trees', {
    method: 'POST',
    body: JSON.stringify({ base_tree: head.treeSha, tree }),
  })
  const commit = await gh<{ sha: string; html_url: string }>('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [head.commitSha] }),
  })

  try {
    await gh(`/git/refs/heads/${githubBranch()}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: false }),
    })
  } catch (err) {
    // 그사이 다른 커밋이 올라오면 덮어쓰지 않고 실패시킨다
    if ((err as { ghStatus?: number }).ghStatus === 422) {
      throw new AdminError('그사이 레포가 바뀌었어요. 한 번 더 저장을 눌러 주세요.', 409)
    }
    throw err
  }

  return { sha: commit.sha, url: commit.html_url }
}
