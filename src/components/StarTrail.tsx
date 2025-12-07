import { useEffect, useRef } from "react";

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
  thickness: number;
  hue: number;
};

const StarTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();

    let stars: ShootingStar[] = [];
    let animationFrameId: number;

    const spawnStar = () => {
      const spawnFromTop = Math.random() < 0.7;
      let x: number;
      let y: number;
      
      if (spawnFromTop) {
        x = width * 0.3 + Math.random() * (width * 0.7);
        y = -60;
      } else {
        x = width + 60;
        y = Math.random() * (height * 0.5);
      }

      const speed = 2.5 + Math.random() * 2;
      const angle = Math.PI * 0.65 + (Math.random() * Math.PI) / 16;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const length = 70 + Math.random() * 90;
      const thickness = 1.5 + Math.random() * 2;
      const maxLife = 75 + Math.random() * 55;
      const hue = 45 + Math.random() * 15;

      stars.push({
        x,
        y,
        vx,
        vy,
        length,
        life: 0,
        maxLife,
        thickness,
        hue,
      });
    };

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      ctx.fillStyle = "rgba(10, 16, 35, 0.15)";
      ctx.fillRect(0, 0, width, height);

      if (stars.length < 8) {
        if (Math.random() < 0.04) {
          spawnStar();
        }
      }

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life += 1;

        const t = s.life / s.maxLife;
        const alpha = Math.pow(1 - t, 0.8);

        if (
          s.life >= s.maxLife ||
          s.x < -120 ||
          s.y > height + 120 ||
          s.x > width + 120
        ) {
          stars.splice(i, 1);
          continue;
        }

        const tailX = s.x - s.vx * s.length;
        const tailY = s.y - s.vy * s.length;

        for (let layer = 0; layer < 2; layer++) {
          const layerAlpha = alpha * (layer === 0 ? 0.3 : 1);
          const layerWidth = s.thickness * (layer === 0 ? 2.5 : 1);
          
          const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
          grad.addColorStop(0, `hsla(${s.hue}, 100%, 70%, 0)`);
          grad.addColorStop(0.2, `hsla(${s.hue}, 100%, 75%, ${layerAlpha * 0.3})`);
          grad.addColorStop(0.5, `hsla(${s.hue}, 100%, 80%, ${layerAlpha * 0.7})`);
          grad.addColorStop(0.85, `hsla(${s.hue}, 100%, 90%, ${layerAlpha * 0.9})`);
          grad.addColorStop(1, `hsla(${s.hue + 10}, 100%, 95%, ${layerAlpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = layerWidth;
          ctx.lineCap = "round";
          ctx.shadowBlur = layer === 0 ? 18 : 10;
          ctx.shadowColor = `hsla(${s.hue}, 100%, 70%, ${layerAlpha * 0.6})`;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        }
        
        ctx.shadowBlur = 25;
        ctx.shadowColor = `hsla(${s.hue}, 100%, 90%, ${alpha * 0.9})`;
        
        ctx.fillStyle = `hsla(${s.hue}, 100%, 85%, ${alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.thickness * 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `hsla(${s.hue + 10}, 100%, 95%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.thickness * 1.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 15;
        ctx.fillStyle = `hsla(60, 100%, 98%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.thickness * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }
    };

    render();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="star-trail-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default StarTrail;