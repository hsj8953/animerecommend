/** @type {import('next').NextConfig} */
const nextConfig = {
  // 포스터를 화면에 보이는 크기에 맞게 줄여서 보낸다 (Vercel 이미지 최적화).
  // 무료 요금제 한도(월 5천 건 변환)를 넘지 않도록 크기 종류를 줄이고 캐시를 길게 잡았다.
  // 원본 포스터는 대부분 가로 400~500px 이라 그보다 큰 크기는 만들지 않는다.
  images: {
    formats: ['image/webp'],
    imageSizes: [96, 128, 192, 256, 384],
    deviceSizes: [480, 640],
    minimumCacheTTL: 60 * 60 * 24 * 31, // 31일
  },
}

export default nextConfig
