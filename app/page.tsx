"use client";

import { useMemo, useState } from "react";

type HardwarePreset = {
  name: string;
  precision: string;
  peakTflops: number;
  bandwidthTbs: number;
  memoryGb: number;
  note: string;
};

const hardwarePresets: HardwarePreset[] = [
  {
    name: "H100 SXM",
    precision: "FP16 dense",
    peakTflops: 989,
    bandwidthTbs: 3.35,
    memoryGb: 80,
    note: "Hopper · 2023 공식 사양",
  },
  {
    name: "B200",
    precision: "FP8 dense",
    peakTflops: 5000,
    bandwidthTbs: 8,
    memoryGb: 180,
    note: "Blackwell · production SKU",
  },
  {
    name: "Rubin",
    precision: "NVFP4",
    peakTflops: 50000,
    bandwidthTbs: 22,
    memoryGb: 288,
    note: "Rubin · 2026 vendor peak",
  },
];

const sources = [
  {
    group: "Models",
    title: "Attention Is All You Need",
    meta: "Vaswani et al. · NeurIPS 2017",
    href: "https://arxiv.org/abs/1706.03762",
  },
  {
    group: "Models",
    title: "FlashAttention",
    meta: "Dao et al. · NeurIPS 2022",
    href: "https://arxiv.org/abs/2205.14135",
  },
  {
    group: "Models",
    title: "PagedAttention / vLLM",
    meta: "Kwon et al. · SOSP 2023",
    href: "https://arxiv.org/abs/2309.06180",
  },
  {
    group: "Models",
    title: "Switch Transformers",
    meta: "Fedus et al. · JMLR 2022",
    href: "https://arxiv.org/abs/2101.03961",
  },
  {
    group: "Media",
    title: "Latent Diffusion Models",
    meta: "Rombach et al. · CVPR 2022",
    href: "https://arxiv.org/abs/2112.10752",
  },
  {
    group: "Media",
    title: "Diffusion Transformers",
    meta: "Peebles & Xie · ICCV 2023",
    href: "https://arxiv.org/abs/2212.09748",
  },
  {
    group: "Media",
    title: "Latent Consistency Models",
    meta: "Luo et al. · 2–4 step inference",
    href: "https://arxiv.org/abs/2310.04378",
  },
  {
    group: "Performance",
    title: "GPU Performance Background",
    meta: "NVIDIA · arithmetic intensity guide",
    href: "https://docs.nvidia.com/deeplearning/performance/pdf/GPU-Performance-Background-User-Guide.pdf",
  },
  {
    group: "Performance",
    title: "AI Model Co-Design",
    meta: "NVIDIA · July 2026",
    href: "https://developer.nvidia.com/blog/ai-model-co-design-hardware-friendly-llm-design/",
  },
  {
    group: "Hardware",
    title: "NVIDIA H100",
    meta: "Official product specifications",
    href: "https://www.nvidia.com/en-us/data-center/h100/",
  },
  {
    group: "Hardware",
    title: "Hopper Tuning Guide",
    meta: "NVIDIA CUDA documentation",
    href: "https://docs.nvidia.com/cuda/hopper-tuning-guide/",
  },
  {
    group: "Hardware",
    title: "Inside Rubin Architecture",
    meta: "NVIDIA · July 2026",
    href: "https://developer.nvidia.com/blog/inside-nvidia-rubin-gpu-architecture-powering-the-era-of-agentic-ai/",
  },
  {
    group: "Hardware",
    title: "MIG User Guide",
    meta: "NVIDIA · supported profiles",
    href: "https://docs.nvidia.com/datacenter/tesla/mig-user-guide/supported-mig-profiles.html",
  },
  {
    group: "Landscape",
    title: "AMD Instinct MI350",
    meta: "AMD official specifications",
    href: "https://www.amd.com/en/products/accelerators/instinct/mi350.html",
  },
  {
    group: "Landscape",
    title: "TPU7x / Ironwood",
    meta: "Google Cloud documentation",
    href: "https://docs.cloud.google.com/tpu/docs/tpu7x",
  },
  {
    group: "Landscape",
    title: "AWS Inferentia",
    meta: "AWS purpose-built inference silicon",
    href: "https://aws.amazon.com/ai/machine-learning/inferentia/",
  },
  {
    group: "Landscape",
    title: "Cerebras WSE-3",
    meta: "Cerebras official architecture claims",
    href: "https://www.cerebras.ai/press-release/cerebras-announces-third-generation-wafer-scale-engine",
  },
  {
    group: "Edge",
    title: "Apple Foundation Models",
    meta: "Apple Developer documentation",
    href: "https://developer.apple.com/documentation/FoundationModels",
  },
  {
    group: "Edge",
    title: "ML Kit GenAI APIs",
    meta: "Google on-device Gemini Nano",
    href: "https://developers.google.com/ml-kit/genai",
  },
];

function SourceMark({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="source-mark" href={href} aria-label={`출처: ${children}`}>
      {children} ↗
    </a>
  );
}

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: digits }).format(value);
}

export default function Home() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [arithmeticIntensity, setArithmeticIntensity] = useState(62);
  const [paramsB, setParamsB] = useState(70);
  const [weightBits, setWeightBits] = useState(8);
  const [layers, setLayers] = useState(80);
  const [kvHeads, setKvHeads] = useState(8);
  const [headDim, setHeadDim] = useState(128);
  const [contextK, setContextK] = useState(32);
  const [batch, setBatch] = useState(4);
  const [kvBits, setKvBits] = useState(16);

  const selectedHardware = hardwarePresets[presetIndex];
  const ridgePoint = selectedHardware.peakTflops / selectedHardware.bandwidthTbs;
  const isMemoryBound = arithmeticIntensity < ridgePoint;
  const roofPointX = Math.min(94, Math.max(5, (Math.log10(arithmeticIntensity) / 4) * 100));
  const ridgeX = Math.min(94, Math.max(5, (Math.log10(ridgePoint) / 4) * 100));

  const memoryMath = useMemo(() => {
    const weightBytes = paramsB * 1e9 * (weightBits / 8);
    const kvBytes =
      batch *
      contextK *
      1024 *
      2 *
      layers *
      kvHeads *
      headDim *
      (kvBits / 8);
    const weightGiB = weightBytes / 2 ** 30;
    const kvGiB = kvBytes / 2 ** 30;
    const totalGiB = weightGiB + kvGiB;
    const lowerBoundMs = (weightBytes / (selectedHardware.bandwidthTbs * 1e12)) * 1000;
    return {
      weightGiB,
      kvGiB,
      totalGiB,
      lowerBoundMs,
      theoreticalTps: 1000 / lowerBoundMs,
      fits: totalGiB <= selectedHardware.memoryGb,
    };
  }, [paramsB, weightBits, batch, contextK, layers, kvHeads, headDim, kvBits, selectedHardware]);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="페이지 맨 위로">
          <span className="brand-mark">IE</span>
          <span>Inference Engineering Study</span>
        </a>
        <nav aria-label="주요 섹션">
          <a href="#chapter-2">02 Models</a>
          <a href="#bridge">Bridge</a>
          <a href="#chapter-3">03 Hardware</a>
          <a href="#lab">Lab</a>
          <a href="#study">Study</a>
        </nav>
      </header>

      <section className="hero section-shell" id="top">
        <div className="eyebrow-row">
          <span className="eyebrow">Deep Dive 01</span>
          <span>Ch. 2–3</span>
          <span>Updated 2026-08-14</span>
        </div>
        <div className="hero-grid">
          <div>
            <p className="kicker">MODEL × HARDWARE</p>
            <h1>
              모델은 무엇을 계산하고,
              <br />
              하드웨어는 무엇을 기다리는가?
            </h1>
            <p className="hero-copy">
              Baseten의 <em>Inference Engineering</em> Chapter 2·3을 출발점으로,
              트랜스포머와 확산 모델의 계산이 GPU의 연산·메모리·인터커넥트에
              어떻게 매핑되는지 1차 출처와 로컬 tech-wiki로 확장한 스터디 노트입니다.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#chapter-2">계산 경로부터 시작</a>
              <a className="button button-secondary" href="#lab">바로 계산해 보기</a>
            </div>
          </div>
          <aside className="hero-aside" aria-label="핵심 질문">
            <p className="aside-label">THE ONE QUESTION</p>
            <p className="big-question">“이 연산은 지금 무엇에 막혀 있는가?”</p>
            <div className="signal-list">
              <span><b>01</b> 충분히 병렬화할 일이 있는가?</span>
              <span><b>02</b> 바이트당 연산이 충분한가?</span>
              <span><b>03</b> 데이터가 한 장치 안에 있는가?</span>
            </div>
          </aside>
        </div>

        <div className="thesis-grid">
          <article>
            <span className="card-index">A</span>
            <h2>단계가 병목을 바꾼다</h2>
            <p>프리필은 많은 토큰을 한꺼번에 처리해 GEMM을 키우고, 저동시성 디코드는 가중치와 KV를 반복해서 읽는다.</p>
          </article>
          <article>
            <span className="card-index">B</span>
            <h2>사양표보다 operating point</h2>
            <p>같은 모델·GPU도 batch, context, precision, kernel에 따라 memory-bound와 compute-bound 사이를 이동한다.</p>
          </article>
          <article>
            <span className="card-index">C</span>
            <h2>칩보다 시스템</h2>
            <p>모델이 들어가는가, 데이터를 먹일 수 있는가, 여러 칩을 충분히 빠르게 연결하는가를 함께 봐야 한다.</p>
          </article>
        </div>
      </section>

      <section className="chapter section-shell" id="chapter-2">
        <div className="chapter-heading">
          <div className="chapter-number">02</div>
          <div>
            <p className="kicker">MODELS</p>
            <h2>계산 그래프를 읽는다</h2>
            <p>모델을 “파라미터 B개”로만 보면 추론 병목이 보이지 않습니다. 어떤 텐서가 언제 만들어지고, 어떤 연산이 반복되며, 무엇을 캐시하는지부터 따라갑니다.</p>
          </div>
          <div className="reading-tag">Book pp. 39–69</div>
        </div>

        <div className="subsection two-column">
          <div>
            <span className="section-label">2.1 · FOUNDATION</span>
            <h3>선형층 + 비선형성 = 깊이</h3>
            <p>
              선형층은 <code>y = xW + b</code>입니다. 하지만 선형층만 연속하면 하나의 큰 선형변환으로 합쳐집니다. SiLU·GELU·SwiGLU 같은 활성화가 선형성을 깨고, residual과 normalization이 깊은 네트워크의 정보 흐름을 안정화합니다.
            </p>
            <div className="equation-card">
              <span>LINEAR</span>
              <strong>Y = XW + b</strong>
              <small>배치가 커질수록 같은 W를 더 많이 재사용 → arithmetic intensity 상승</small>
            </div>
          </div>
          <div className="layer-stack" aria-label="신경망 레이어 흐름">
            <div><span>INPUT</span><b>token embeddings</b></div>
            <i>↓</i>
            <div className="active"><span>HIDDEN × N</span><b>attention + FFN</b></div>
            <i>↓</i>
            <div><span>OUTPUT</span><b>vocabulary logits</b></div>
          </div>
        </div>

        <div className="subsection">
          <span className="section-label">2.2 · TRANSFORMER BLOCK</span>
          <div className="split-title">
            <h3>한 토큰이 블록을 통과하는 길</h3>
            <SourceMark href="https://arxiv.org/abs/1706.03762">Vaswani et al.</SourceMark>
          </div>
          <div className="transformer-flow">
            <div className="flow-node neutral"><span>01</span><b>RMSNorm</b><small>scale 안정화</small></div>
            <div className="flow-arrow">→</div>
            <div className="flow-node accent"><span>02</span><b>Self-Attention</b><small>token mixing</small></div>
            <div className="flow-arrow">→</div>
            <div className="flow-node neutral"><span>03</span><b>Residual</b><small>x + attention(x)</small></div>
            <div className="flow-arrow">→</div>
            <div className="flow-node dark"><span>04</span><b>FFN / MoE</b><small>channel mixing</small></div>
            <div className="flow-arrow">→</div>
            <div className="flow-node neutral"><span>05</span><b>Residual</b><small>x + ffn(x)</small></div>
          </div>
          <div className="attention-grid">
            <div className="attention-formula">
              <span className="formula-label">SCALED DOT-PRODUCT ATTENTION</span>
              <p>softmax( QKᵀ / √d<sub>k</sub> )V</p>
              <div className="qkv-row">
                <span><b>Q</b> 지금 찾는 것</span>
                <span><b>K</b> 이전 token의 주소</span>
                <span><b>V</b> 꺼내올 내용</span>
              </div>
            </div>
            <div className="attention-note">
              <h4>복잡도는 한 문장으로 끝나지 않는다</h4>
              <ul>
                <li>전체 시퀀스 attention score는 <b>O(N²)</b>.</li>
                <li>KV cache를 쓰는 한 번의 decode step은 새 query 하나가 N개의 K/V를 읽어 <b>O(N)</b>.</li>
                <li>N개 토큰을 끝까지 생성하는 누적 attention 일은 다시 <b>O(N²)</b>.</li>
                <li>KV cache 용량은 context 길이에 대해 <b>O(N)</b>.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="subsection phase-section">
          <span className="section-label">2.2 · INFERENCE LOOP</span>
          <h3>같은 모델, 정반대의 두 국면</h3>
          <div className="phase-grid">
            <article className="phase-card prefill">
              <div className="phase-top"><span>PREFILL</span><b>입력 전체</b></div>
              <div className="token-strip many"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
              <h4>큰 GEMM, 높은 재사용</h4>
              <p>prompt token을 병렬 처리해 KV cache를 만든다. 충분한 token 수에서는 weights를 한 번 읽어 많은 연산에 재사용하므로 compute-bound가 되기 쉽다.</p>
              <dl>
                <div><dt>사용자 지표</dt><dd>TTFT</dd></div>
                <div><dt>주요 자원</dt><dd>Tensor Core</dd></div>
                <div><dt>키우는 축</dt><dd>token batch</dd></div>
              </dl>
            </article>
            <article className="phase-card decode">
              <div className="phase-top"><span>DECODE</span><b>한 번에 1 token</b></div>
              <div className="token-strip one"><i></i><i></i><i></i><i></i><i className="current"></i></div>
              <h4>작은 GEMV/GEMM, 반복 읽기</h4>
              <p>새 token마다 weights와 늘어난 KV를 다시 읽는다. 낮은 동시성에서는 weight reuse가 낮아 memory bandwidth가 latency를 지배하기 쉽다.</p>
              <dl>
                <div><dt>사용자 지표</dt><dd>TPOT / TPS</dd></div>
                <div><dt>주요 자원</dt><dd>HBM bandwidth</dd></div>
                <div><dt>키우는 축</dt><dd>concurrency</dd></div>
              </dl>
            </article>
          </div>
          <p className="nuance-line"><b>중요한 단서:</b> “prefill=compute, decode=memory”는 좋은 첫 모델이지 법칙이 아닙니다. 짧은 prompt, 작은 batch, 긴 KV, kernel 효율, speculative decoding에 따라 실제 operating point가 달라지므로 profiler로 확인해야 합니다. <SourceMark href="https://docs.nvidia.com/deeplearning/performance/pdf/GPU-Performance-Background-User-Guide.pdf">NVIDIA performance guide</SourceMark></p>
        </div>

        <div className="subsection optimization-pairs">
          <span className="section-label">2.5 · ATTENTION OPTIMIZATION</span>
          <h3>FlashAttention과 PagedAttention은 다른 문제를 푼다</h3>
          <div className="pair-grid">
            <article>
              <div className="pair-badge">KERNEL / IO</div>
              <h4>FlashAttention</h4>
              <p>정확한 attention 수식은 유지하면서 tiling과 online softmax로 HBM↔SRAM 왕복과 중간 NxN materialization을 줄입니다.</p>
              <p className="pair-result">계산 결과는 같고, <b>데이터 이동 방식</b>이 바뀐다.</p>
              <SourceMark href="https://arxiv.org/abs/2205.14135">Paper</SourceMark>
            </article>
            <article>
              <div className="pair-badge">ALLOCATION / SERVING</div>
              <h4>PagedAttention</h4>
              <p>요청별로 커졌다 줄어드는 KV cache를 고정 크기 block으로 나눠 fragmentation과 중복을 줄이고 공유를 가능하게 합니다.</p>
              <p className="pair-result">attention math보다 <b>메모리 관리</b>가 바뀐다.</p>
              <SourceMark href="https://arxiv.org/abs/2309.06180">Paper</SourceMark>
            </article>
          </div>
        </div>

        <div className="subsection model-branches">
          <span className="section-label">2.2.4 + 2.3 · TWO BRANCHES</span>
          <h3>희소 LLM과 반복 생성 모델</h3>
          <div className="branch-grid">
            <article className="moe-card">
              <p className="branch-kicker">Mixture of Experts</p>
              <h4>총 파라미터 ≠ 활성 파라미터</h4>
              <div className="experts" aria-label="전문가 라우팅 예시">
                <span>E1</span><span className="selected">E2</span><span>E3</span><span>E4</span><span className="selected">E5</span><span>E6</span>
              </div>
              <p>router가 token마다 일부 FFN만 고르므로 FLOPs는 줄지만, 전체 expert weight의 residency·prefetch와 expert-parallel all-to-all은 남습니다. 큰 batch에서는 서로 다른 요청이 많은 expert를 깨웁니다.</p>
              <SourceMark href="https://arxiv.org/abs/2101.03961">Switch Transformer</SourceMark>
            </article>
            <article className="diffusion-card">
              <p className="branch-kicker">Image / Video Diffusion</p>
              <h4>노이즈에서 latent로, 여러 번</h4>
              <div className="denoise-steps"><span>noise</span><i></i><i></i><i></i><b>latent</b><em>VAE</em><strong>pixels</strong></div>
              <p>latent diffusion은 pixel 공간 대신 압축 표현에서 반복 denoise합니다. DiT는 latent patch에 transformer를 적용합니다. 병목은 대체로 큰 병렬 attention·GEMM이므로 compute 쪽에 가깝고, step 수를 줄이는 LCM은 다른 최적화 축입니다.</p>
              <div className="inline-sources"><SourceMark href="https://arxiv.org/abs/2112.10752">LDM</SourceMark><SourceMark href="https://arxiv.org/abs/2212.09748">DiT</SourceMark><SourceMark href="https://arxiv.org/abs/2310.04378">LCM</SourceMark></div>
            </article>
          </div>
        </div>
      </section>

      <section className="bridge section-shell" id="bridge">
        <div className="bridge-intro">
          <span className="section-label inverted">2.4 · THE BRIDGE</span>
          <h2>Roofline이 Chapter 2와 3을 잇는다</h2>
          <p>모델이 요구하는 바이트당 연산량과 하드웨어가 제공하는 FLOPS:bandwidth 비율을 같은 축에 놓으면, 어떤 최적화가 먹힐지 먼저 가설을 세울 수 있습니다.</p>
        </div>
        <div className="roofline-explainer">
          <div className="roofline-mini" aria-label="루프라인 개념도">
            <span className="axis-y">PERFORMANCE</span>
            <span className="axis-x">ARITHMETIC INTENSITY →</span>
            <div className="memory-roof"></div>
            <div className="compute-roof"></div>
            <span className="zone memory-zone">MEMORY<br/>BOUND</span>
            <span className="zone compute-zone">COMPUTE<br/>BOUND</span>
          </div>
          <div className="bridge-formulas">
            <div><span>WORKLOAD</span><b>Arithmetic intensity</b><code>FLOPs / bytes moved</code></div>
            <div><span>HARDWARE</span><b>Ridge point</b><code>peak FLOP/s / byte/s</code></div>
            <p>AI &lt; ridge → bandwidth ceiling<br/>AI &gt; ridge → compute ceiling</p>
          </div>
        </div>
        <aside className="audit-note">
          <span>BOOK AUDIT · p.64–66</span>
          <h3>“decode 예제”의 차원을 다시 보자</h3>
          <p>책의 예제는 Q·K·V를 모두 <code>N×d</code>, score를 <code>N×N</code>으로 놓습니다. 이는 새 query가 <code>1×d</code>인 실제 cached decode step보다 전체 시퀀스 attention에 가까운 차원입니다. 산술 강도 62라는 계산은 naive materialized attention의 학습용 직관으로는 유용하지만, 실제 decode kernel·전체 모델의 병목을 그대로 대표하지는 않습니다.</p>
          <div className="audit-comparison">
            <span><b>Full sequence</b>Q: N×d · scores: N×N</span>
            <span><b>Cached decode</b>Q: 1×d · scores: 1×N</span>
          </div>
          <p className="audit-foot">이 지적은 책의 표기와 attention 식을 대조한 <b>분석적 추론</b>입니다. 최종 판단은 Nsight Compute의 measured bytes·FLOPs·occupancy로 확인해야 합니다.</p>
        </aside>
      </section>

      <section className="chapter section-shell" id="chapter-3">
        <div className="chapter-heading">
          <div className="chapter-number">03</div>
          <div>
            <p className="kicker">HARDWARE</p>
            <h2>데이터의 이동 경로를 읽는다</h2>
            <p>GPU는 “코어가 많은 CPU”가 아닙니다. 수많은 thread의 준비된 warp를 교대로 실행하고, 작은 고속 메모리에서 데이터를 재사용해 느린 HBM 접근을 가리는 throughput machine입니다.</p>
          </div>
          <div className="reading-tag">Book pp. 71–91</div>
        </div>

        <div className="subsection gpu-section">
          <div className="split-title">
            <div><span className="section-label">3.1 · GPU ANATOMY</span><h3>아래에서 위로 갈수록 빠르고 작다</h3></div>
            <SourceMark href="https://docs.nvidia.com/cuda/hopper-tuning-guide/">Hopper guide</SourceMark>
          </div>
          <div className="gpu-grid">
            <div className="gpu-diagram" aria-label="GPU 메모리와 연산 구조">
              <div className="gpu-label">ACCELERATOR PACKAGE</div>
              <div className="hbm-block"><span>HBM / VRAM</span><b>capacity + bandwidth</b></div>
              <div className="bus-lines"><i></i><i></i><i></i><i></i><i></i></div>
              <div className="l2-block"><span>L2 CACHE</span><b>shared across SMs</b></div>
              <div className="sm-row">
                {[1, 2, 3, 4].map((n) => (
                  <div className="sm" key={n}><span>SM {n}</span><b>L1 / shared</b><small>Tensor Cores</small><div className="warp-dots"><i></i><i></i><i></i><i></i></div></div>
                ))}
              </div>
            </div>
            <div className="gpu-principles">
              <article><span>COMPUTE</span><h4>Tensor Core</h4><p>행렬 곱-누산(MMA)을 low precision으로 대량 처리. precision과 dense/sparse 표기를 맞춰 비교해야 합니다.</p></article>
              <article><span>SCHEDULE</span><h4>Warp</h4><p>32 thread가 하나의 실행 묶음. 한 warp가 memory에 막히면 scheduler가 준비된 다른 warp를 issue해 latency를 숨깁니다.</p></article>
              <article><span>MEMORY</span><h4>HBM → L2 → shared</h4><p>성능은 peak HBM 숫자만이 아니라 coalescing, cache hit, tiling, reuse가 만든 achieved bandwidth로 결정됩니다.</p></article>
            </div>
          </div>
        </div>

        <div className="subsection three-tests">
          <span className="section-label">THE THREE-TEST METHOD</span>
          <h3>GPU를 고르기 전 세 문장</h3>
          <div className="test-grid">
            <article><span>01 · FIT</span><h4>들어가는가?</h4><p>weights + KV cache + activations + engine workspace가 HBM capacity 안에 들어가야 합니다.</p><b>GB / GiB</b></article>
            <article><span>02 · FEED</span><h4>먹일 수 있는가?</h4><p>연산기가 쉬지 않도록 HBM과 cache hierarchy가 필요한 바이트를 제때 공급해야 합니다.</p><b>TB/s · FLOP/B</b></article>
            <article><span>03 · CONNECT</span><h4>나눌 수 있는가?</h4><p>한 GPU를 넘으면 tensor/expert/context parallel collective가 topology를 건넙니다.</p><b>GB/s · latency</b></article>
          </div>
        </div>

        <div className="subsection generation-section">
          <span className="section-label">3.2 · GENERATIONS</span>
          <div className="split-title">
            <h3>2026년 8월의 데이터센터 GPU</h3>
            <p className="vendor-label">모든 peak 수치는 vendor-claim</p>
          </div>
          <div className="timeline">
            <article>
              <span className="timeline-year">2022</span>
              <h4>Hopper · H100</h4>
              <dl><div><dt>HBM</dt><dd>80 GB</dd></div><div><dt>Bandwidth</dt><dd>3.35 TB/s</dd></div><div><dt>FP16 dense</dt><dd>989 TFLOPS</dd></div><div><dt>NVLink</dt><dd>900 GB/s</dd></div></dl>
              <p>FP8 Transformer Engine, TMA, thread-block cluster. 성숙한 software/kernel 생태계가 강점.</p>
            </article>
            <article className="featured">
              <span className="timeline-year">2024–25</span>
              <h4>Blackwell · B200</h4>
              <dl><div><dt>HBM3e</dt><dd>180 GB</dd></div><div><dt>Bandwidth</dt><dd>8 TB/s</dd></div><div><dt>FP8 dense</dt><dd>5 PFLOPS</dd></div><div><dt>NVLink 5</dt><dd>1.8 TB/s</dd></div></dl>
              <p>NVFP4, dual-reticle GPU, 더 큰 memory와 2× scale-up link. production B200 SKU는 현재 문서상 180 GB.</p>
            </article>
            <article>
              <span className="timeline-year">2026</span>
              <h4>Rubin</h4>
              <dl><div><dt>HBM4</dt><dd>288 GB</dd></div><div><dt>Bandwidth</dt><dd>22 TB/s</dd></div><div><dt>NVFP4</dt><dd>50 PFLOPS</dd></div><div><dt>NVLink 6</dt><dd>3.6 TB/s</dd></div></dl>
              <p>decode의 memory subsystem과 long-context attention을 전면에 둔 세대. 2026년 peak 수치는 실제 workload benchmark와 분리해 봐야 함.</p>
            </article>
          </div>
          <div className="spec-correction">
            <span>SPEC HYGIENE</span>
            <p><b>H100 1,979 FP16 TFLOPS는 sparsity 적용 값</b>이며 dense는 989입니다. B200은 초기/architecture 자료의 192 GB와 달리 현재 production SKU·MIG 문서에서는 180 GB로 표시됩니다. 비교표는 항상 precision, sparsity, form factor, 발표 시점을 함께 기록해야 합니다.</p>
            <SourceMark href="https://www.nvidia.com/en-us/data-center/h100/">H100 specs</SourceMark>
          </div>
        </div>

        <div className="subsection topology-section">
          <span className="section-label">3.3 · INSTANCE & TOPOLOGY</span>
          <h3>“GPU 몇 장?”보다 “어떻게 연결?”</h3>
          <div className="topology-ladder">
            <div><span>ON CHIP</span><b>Shared / L2</b><em>kernel tiling · reuse</em></div>
            <i>⇄</i>
            <div><span>ONE GPU</span><b>HBM</b><em>weights · KV · activations</em></div>
            <i>⇄</i>
            <div><span>SCALE UP</span><b>NVLink + NVSwitch</b><em>TP / EP collectives</em></div>
            <i>⇄</i>
            <div><span>SCALE OUT</span><b>InfiniBand / Ethernet</b><em>node-to-node topology</em></div>
          </div>
          <div className="instance-grid">
            <article><span className="instance-label">INSTANCE</span><h4>가속기만 사는 것이 아니다</h4><p>CPU, host memory, storage, NIC, NUMA, PCIe topology가 함께 배정됩니다. CPU 전처리나 host↔device 복사가 느리면 GPU가 쉬게 됩니다.</p></article>
            <article><span className="instance-label">MIG</span><h4>작은 모델에 격리된 slice</h4><p>H100·B200은 최대 7개 MIG instance를 지원합니다. compute와 memory slice가 함께 나뉘지만, profile별 비율은 단순 1/7이 아니므로 공식 geometry를 확인해야 합니다.</p><SourceMark href="https://docs.nvidia.com/datacenter/tesla/mig-user-guide/supported-mig-profiles.html">MIG profiles</SourceMark></article>
            <article><span className="instance-label">PARALLELISM</span><h4>통신 빈도가 placement를 결정</h4><p>layer마다 collective가 필요한 TP는 빠른 scale-up fabric에, 덜 자주 통신하는 축은 scale-out에 배치하는 것이 기본 출발점입니다.</p></article>
          </div>
        </div>

        <div className="subsection landscape-section">
          <span className="section-label">3.4 · OTHER ACCELERATORS</span>
          <h3>NVIDIA 밖에서는 무엇을 바꾸었나?</h3>
          <p className="section-intro">아래 수치는 서로 다른 precision·system boundary를 써서 성능 순위표가 아닙니다. 각 설계가 어느 병목에 돈을 썼는지 보는 지도입니다.</p>
          <div className="landscape-grid">
            <article><div className="landscape-head"><b>AMD MI350</b><span>GPU</span></div><strong>288 GB · 8 TB/s</strong><p>대용량 HBM3e와 CDNA 4 Matrix Core. 선택의 핵심은 ROCm와 production software support까지 포함한 stack 검증.</p><SourceMark href="https://www.amd.com/en/products/accelerators/instinct/mi350.html">AMD</SourceMark></article>
            <article><div className="landscape-head"><b>Google TPU7x</b><span>ASIC</span></div><strong>192 GiB · 7.38 TB/s</strong><p>TensorCore·SparseCore와 1.2 TB/s ICI를 pod topology로 묶음. JAX/PyTorch와 XLA compiler가 hardware 계약의 일부.</p><SourceMark href="https://docs.cloud.google.com/tpu/docs/tpu7x">Google</SourceMark></article>
            <article><div className="landscape-head"><b>AWS Inferentia</b><span>ASIC</span></div><strong>Neuron SDK</strong><p>cloud instance와 compiler/runtime를 함께 제공해 price-performance를 겨냥. 모델·operator가 Neuron에서 잘 지원되는지가 1차 gate.</p><SourceMark href="https://aws.amazon.com/ai/machine-learning/inferentia/">AWS</SourceMark></article>
            <article><div className="landscape-head"><b>Cerebras WSE-3</b><span>WAFER</span></div><strong>44 GB SRAM · 21 PB/s</strong><p>거대한 on-chip SRAM으로 decode의 weight-streaming 병목을 공격. 숫자는 vendor aggregate claim이며 외부 scale-out 방식까지 함께 평가해야 함.</p><SourceMark href="https://www.cerebras.ai/press-release/cerebras-announces-third-generation-wafer-scale-engine">Cerebras</SourceMark></article>
          </div>
        </div>

        <div className="subsection edge-section">
          <span className="section-label">3.5 · LOCAL INFERENCE</span>
          <div className="edge-grid">
            <div><h3>로컬 vs 클라우드가 아니라, 어디까지 로컬인가</h3><p>네트워크 왕복·서버 비용·데이터 이동을 없애는 대신 device matrix, thermal, battery, model update와 context 제약을 떠안습니다. 제품 기능을 task 단위로 분해해 placement해야 합니다.</p></div>
            <div className="edge-balance">
              <article className="positive"><span>LOCAL WINS</span><p>offline · privacy · instant UI · zero marginal server cost</p></article>
              <article className="negative"><span>CLOUD WINS</span><p>large model · long context · sustained compute · centralized updates</p></article>
              <article className="hybrid"><span>HYBRID</span><p>짧은 요약·분류는 device, 복잡한 reasoning은 cloud escalation</p></article>
            </div>
          </div>
          <div className="edge-links"><SourceMark href="https://developer.apple.com/documentation/FoundationModels">Apple Foundation Models</SourceMark><SourceMark href="https://developers.google.com/ml-kit/genai">Android ML Kit GenAI</SourceMark></div>
        </div>
      </section>

      <section className="lab section-shell" id="lab">
        <div className="lab-heading">
          <span className="section-label inverted">INTERACTIVE LAB</span>
          <h2>감으로 말하지 말고, 먼저 계산한다</h2>
          <p>아래 값은 1차 근사입니다. scheduler, kernel efficiency, cache hit, communication, activation workspace를 제외하므로 sizing과 가설 수립에만 사용하세요.</p>
        </div>

        <div className="hardware-tabs" role="group" aria-label="하드웨어 프리셋">
          {hardwarePresets.map((preset, index) => (
            <button className={index === presetIndex ? "active" : ""} key={preset.name} onClick={() => setPresetIndex(index)} aria-pressed={index === presetIndex}>
              <b>{preset.name}</b><span>{preset.precision}</span>
            </button>
          ))}
        </div>

        <div className="lab-grid">
          <article className="lab-card roofline-lab">
            <div className="lab-card-head"><div><span>LAB 01</span><h3>Roofline 위치</h3></div><b>{isMemoryBound ? "MEMORY BOUND" : "COMPUTE BOUND"}</b></div>
            <label htmlFor="ai-slider">Arithmetic intensity <strong>{arithmeticIntensity} FLOP/B</strong></label>
            <input id="ai-slider" type="range" min="1" max="1000" value={arithmeticIntensity} onChange={(event) => setArithmeticIntensity(Number(event.target.value))} />
            <div className="live-roofline" aria-label={`현재 ${isMemoryBound ? "메모리" : "연산"} 병목 영역`}>
              <span className="live-y">PERF</span><span className="live-x">FLOP/B →</span>
              <div className="live-memory"></div><div className="live-compute"></div>
              <div className="ridge-marker" style={{ left: `${ridgeX}%` }}><span>ridge {formatNumber(ridgePoint, 0)}</span></div>
              <div className={`workload-dot ${isMemoryBound ? "memory" : "compute"}`} style={{ left: `${roofPointX}%` }}><span>workload</span></div>
            </div>
            <div className="lab-summary"><div><span>Peak compute</span><b>{formatNumber(selectedHardware.peakTflops, 0)} TFLOP/s</b></div><div><span>Bandwidth</span><b>{selectedHardware.bandwidthTbs} TB/s</b></div><div><span>Ridge</span><b>{formatNumber(ridgePoint, 0)} FLOP/B</b></div></div>
            <p className="lab-caveat">{selectedHardware.note}. 서로 다른 precision의 ridge를 직접 성능 비교에 사용하지 마세요.</p>
          </article>

          <article className="lab-card memory-lab">
            <div className="lab-card-head"><div><span>LAB 02</span><h3>HBM fit & decode floor</h3></div><b className={memoryMath.fits ? "fit" : "no-fit"}>{memoryMath.fits ? "FITS*" : "DOES NOT FIT"}</b></div>
            <div className="input-grid">
              <label>Params (B)<input type="number" min="1" max="2000" value={paramsB} onChange={(e) => setParamsB(Number(e.target.value))}/></label>
              <label>Weight bits<select value={weightBits} onChange={(e) => setWeightBits(Number(e.target.value))}><option value="16">16-bit</option><option value="8">8-bit</option><option value="4">4-bit</option></select></label>
              <label>Layers<input type="number" min="1" max="256" value={layers} onChange={(e) => setLayers(Number(e.target.value))}/></label>
              <label>KV heads<input type="number" min="1" max="256" value={kvHeads} onChange={(e) => setKvHeads(Number(e.target.value))}/></label>
              <label>Head dim<input type="number" min="16" max="512" step="16" value={headDim} onChange={(e) => setHeadDim(Number(e.target.value))}/></label>
              <label>Context (K)<input type="number" min="1" max="1024" value={contextK} onChange={(e) => setContextK(Number(e.target.value))}/></label>
              <label>Batch<input type="number" min="1" max="1024" value={batch} onChange={(e) => setBatch(Number(e.target.value))}/></label>
              <label>KV bits<select value={kvBits} onChange={(e) => setKvBits(Number(e.target.value))}><option value="16">16-bit</option><option value="8">8-bit</option><option value="4">4-bit</option></select></label>
            </div>
            <div className="memory-bar" aria-label={`필요 메모리 ${formatNumber(memoryMath.totalGiB)} GiB, 장치 ${selectedHardware.memoryGb} GB`}><div className="weight-segment" style={{ width: `${Math.min(100, (memoryMath.weightGiB / Math.max(memoryMath.totalGiB, selectedHardware.memoryGb)) * 100)}%` }}></div><div className="kv-segment" style={{ width: `${Math.min(100, (memoryMath.kvGiB / Math.max(memoryMath.totalGiB, selectedHardware.memoryGb)) * 100)}%` }}></div><span className="device-limit" style={{ left: `${Math.min(100, (selectedHardware.memoryGb / Math.max(memoryMath.totalGiB, selectedHardware.memoryGb)) * 100)}%` }}></span></div>
            <div className="memory-legend"><span><i className="weight-dot"></i>Weights {formatNumber(memoryMath.weightGiB)} GiB</span><span><i className="kv-dot"></i>KV {formatNumber(memoryMath.kvGiB)} GiB</span><span>Total {formatNumber(memoryMath.totalGiB)} GiB</span></div>
            <div className="decode-floor"><span>가중치 1회 순차 읽기 하한</span><b>{formatNumber(memoryMath.lowerBoundMs)} ms/token</b><small>≈ {formatNumber(memoryMath.theoreticalTps)} tok/s · 100% peak bandwidth 가정</small></div>
            <p className="lab-caveat">* activations, allocator fragmentation, CUDA graph, engine workspace, KV block overhead를 포함하지 않습니다. GB(10⁹) 장치 사양과 GiB(2³⁰) 계산 차이도 감안해야 합니다.</p>
          </article>
        </div>
      </section>

      <section className="study section-shell" id="study">
        <div className="study-heading">
          <span className="section-label">STUDY PLAYBOOK</span>
          <h2>세 번의 발표로 나눈다면</h2>
        </div>
        <div className="session-grid">
          <article><span>SESSION 01 · MODEL</span><h3>텐서의 생애</h3><p>transformer block → attention → KV cache → MoE와 diffusion까지, shape와 반복 횟수를 그린다.</p><ul><li>Q/K/V shape 직접 쓰기</li><li>prefill/decode trace 비교</li><li>활성 vs 총 파라미터 구분</li></ul></article>
          <article><span>SESSION 02 · BOTTLENECK</span><h3>Roofline 실습</h3><p>한 operation의 FLOPs와 bytes를 세고, batch·precision·kernel이 ridge를 어떻게 움직이는지 실험한다.</p><ul><li>naive vs FlashAttention IO</li><li>KV cache sizing</li><li>profiler 결과와 1차 근사 대조</li></ul></article>
          <article><span>SESSION 03 · HARDWARE</span><h3>Fit · Feed · Connect</h3><p>GPU 한 장, 한 node, 여러 node, MIG, edge까지 같은 세 질문으로 hardware placement를 비교한다.</p><ul><li>dense/sparse spec hygiene</li><li>collective와 topology</li><li>software support matrix</li></ul></article>
        </div>

        <div className="discussion-grid">
          <div>
            <h3>토론 질문</h3>
            <ol>
              <li><span>01</span>Decode는 언제 compute-bound가 될 수 있는가?</li>
              <li><span>02</span>GQA·MLA가 줄이는 것은 FLOPs인가, KV bytes인가?</li>
              <li><span>03</span>MoE의 active params가 작아도 HBM capacity가 필요한 이유는?</li>
              <li><span>04</span>TP degree를 올렸는데 latency가 나빠지는 경계는 어디인가?</li>
              <li><span>05</span>어떤 기능을 edge로 보내고 어떤 기능은 cloud에 남길 것인가?</li>
            </ol>
          </div>
          <aside>
            <span>PRESENTATION CONTRACT</span>
            <h3>주장 하나에 증거 하나</h3>
            <p>모든 발표 슬라이드는 이 순서를 지킵니다.</p>
            <div className="contract-flow"><b>Claim</b><i>→</i><b>Model</b><i>→</i><b>Measurement</b><i>→</i><b>Caveat</b></div>
            <small>vendor peak / measured / derived / estimated를 명시하고, precision·batch·sequence·date를 빠뜨리지 않습니다.</small>
          </aside>
        </div>

        <div className="wiki-panel">
          <div><span>LOCAL KNOWLEDGE BASE</span><h3>tech-wiki에서 가져온 연결</h3><p>로컬 wiki는 근거 그 자체가 아니라 탐색 지도입니다. 이 페이지의 핵심 수치는 아래 wiki 문서가 가리킨 raw·공식 출처로 다시 확인했습니다.</p></div>
          <ul>
            <li><code>wiki/concepts/inference/prefill-decode.md</code></li>
            <li><code>wiki/concepts/inference/roofline.md</code></li>
            <li><code>wiki/concepts/inference/transformer-architecture.md</code></li>
            <li><code>wiki/topics/llm-inference-memory-bottleneck.md</code></li>
            <li><code>wiki/concepts/memory/memory-bandwidth.md</code></li>
            <li><code>wiki/concepts/architecture/warp-scheduling.md</code></li>
            <li><code>wiki/concepts/optimization/mixture-of-experts.md</code></li>
            <li><code>wiki/concepts/architecture/tensor-parallelism.md</code></li>
          </ul>
        </div>
      </section>

      <section className="sources section-shell" id="sources">
        <div className="sources-heading"><div><span className="section-label">PRIMARY SOURCES</span><h2>더 깊이 읽기</h2></div><p>기술 주장은 논문·공식 문서로, 제품 수치는 2026-08-14 기준 vendor 자료로 검증했습니다. 벤더 수치는 실측 성능이 아닙니다.</p></div>
        <div className="source-list">
          {sources.map((source, index) => (
            <a href={source.href} key={source.title}>
              <span className="source-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="source-group">{source.group}</span>
              <span className="source-title"><b>{source.title}</b><small>{source.meta}</small></span>
              <span className="source-arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="section-shell">
        <div><b>Inference Engineering Study</b><span>Chapter 2 · Models / Chapter 3 · Hardware</span></div>
        <p>Book: Philip Kiely, <em>Inference Engineering</em>, Baseten Books, 2026. 원문을 대체하지 않는 확장 학습 자료입니다.</p>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
