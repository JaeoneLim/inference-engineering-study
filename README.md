# Inference Engineering — Models × Hardware

Baseten의 *Inference Engineering* Chapter 2–3을 모델 계산과 하드웨어 병목의 한 흐름으로 연결한 한국어 인터랙티브 딥다이브입니다.

Book reference: [Inference Engineering | Baseten Books](https://www.baseten.co/inference-engineering/)

## 포함 내용

- Transformer, attention, KV cache, MoE, diffusion의 추론 계산 경로
- Prefill/decode와 FlashAttention/PagedAttention의 역할 구분
- Roofline 기반 bottleneck 분석과 원문 예제의 차원 감사
- GPU memory hierarchy, Hopper/Blackwell/Rubin, topology, MIG, 대안 가속기
- Hardware preset을 바꿔 보는 arithmetic-intensity 및 HBM/KV 계산기
- 1차 논문·공식 하드웨어 문서와 로컬 tech-wiki를 연결한 참고 자료

## 실행과 검증

```bash
npm install
npm run dev
npm run lint
npm test
npm run build:pages
```

`npm test`는 production build와 서버 렌더링 결과를 검증합니다.

## GitHub Pages

`.github/workflows/deploy-pages.yml`은 `main` 브랜치가 갱신될 때 정적 사이트를 빌드하고 GitHub Pages에 배포합니다. 수동 실행도 지원합니다.

이 페이지는 원문을 대체하지 않는 확장 학습 자료입니다.
