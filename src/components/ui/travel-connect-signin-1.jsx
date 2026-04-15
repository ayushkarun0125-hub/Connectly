import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion as m } from "framer-motion";
const Motion = m;

const ROUTES = [
  { start: { x: 100, y: 150, delay: 0 }, end: { x: 200, y: 80, delay: 2 }, color: "#2563eb" },
  { start: { x: 200, y: 80, delay: 2 }, end: { x: 260, y: 120, delay: 4 }, color: "#2563eb" },
  { start: { x: 50, y: 50, delay: 1 }, end: { x: 150, y: 180, delay: 3 }, color: "#2563eb" },
  { start: { x: 280, y: 60, delay: 0.5 }, end: { x: 180, y: 180, delay: 2.5 }, color: "#2563eb" },
];

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Button = ({ children, variant = "default", className = "", ...props }) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variantStyles = {
    default:
      "bg-primary bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-offset-slate-900 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

const DotMap = () => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const generateDots = (width, height) => {
    const dots = [];
    const gap = 12;
    const dotRadius = 1;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        const isInMapShape =
          ((x < width * 0.25 && x > width * 0.05) && (y < height * 0.4 && y > height * 0.1)) ||
          ((x < width * 0.25 && x > width * 0.15) && (y < height * 0.8 && y > height * 0.4)) ||
          ((x < width * 0.45 && x > width * 0.3) && (y < height * 0.35 && y > height * 0.15)) ||
          ((x < width * 0.5 && x > width * 0.35) && (y < height * 0.65 && y > height * 0.35)) ||
          ((x < width * 0.7 && x > width * 0.45) && (y < height * 0.5 && y > height * 0.1)) ||
          ((x < width * 0.8 && x > width * 0.65) && (y < height * 0.8 && y > height * 0.6));

        if (isInMapShape && Math.random() > 0.3) {
          dots.push({ x, y, radius: dotRadius, opacity: Math.random() * 0.5 + 0.2 });
        }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    resizeObserver.observe(canvas.parentElement);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId;
    let startTime = Date.now();

    const drawDots = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${dot.opacity})`;
        ctx.fill();
      });
    };

    const drawRoutes = () => {
      const currentTime = (Date.now() - startTime) / 1000;
      ROUTES.forEach((route) => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;
        const duration = 3;
        const progress = Math.min(elapsed / duration, 1);
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(59, 130, 246, 0.4)";
        ctx.fill();

        if (progress === 1) {
          ctx.beginPath();
          ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.fill();
        }
      });
    };

    const animate = () => {
      drawDots();
      drawRoutes();
      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 15) startTime = Date.now();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};

const SignInCard = ({
  onSubmit,
  onGoogleSignIn,
  onForgotPassword,
  onBackToLanding,
  loading = false,
  errorMessage = "",
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        {onBackToLanding ? (
          <button
            type="button"
            onClick={onBackToLanding}
            className="absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-sm font-medium text-slate-300 shadow-sm backdrop-blur-sm transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white md:left-4 md:top-4"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="hidden sm:inline">Back to home</span>
            <span className="sm:hidden">Back</span>
          </button>
        ) : null}
        <div className="relative hidden h-[600px] w-1/2 overflow-hidden border-r border-slate-800 md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
            <DotMap />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8">
              <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
              </Motion.div>
              <Motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }} className="mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-center text-3xl font-bold text-transparent">
                Connectly
              </Motion.h2>
              <Motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }} className="max-w-xs text-center text-sm text-slate-300">
                Collaborate instantly with your team through rooms, whiteboards, and shared files.
              </Motion.p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex w-full flex-col justify-center bg-slate-900 p-8 md:w-1/2 md:p-10",
            onBackToLanding ? "pt-16 sm:pt-14 md:pt-10" : "",
          )}
        >
          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="mb-1 text-2xl font-bold text-slate-100 md:text-3xl">Welcome back</h1>
            <p className="mb-8 text-slate-400">Sign in to your account</p>
            <div className="mb-6">
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 p-3 text-slate-200 shadow-sm transition-all duration-300 hover:bg-slate-700"
                onClick={(e) => {
                  e.preventDefault();
                  onGoogleSignIn?.();
                }}
                disabled={loading}
              >
                <ArrowRight className="h-5 w-5" />
                <span>Login with Google</span>
              </button>
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
              <div className="relative flex justify-center text-sm"><span className="bg-slate-900 px-2 text-slate-400">or</span></div>
            </div>
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.({ email, password });
              }}
            >
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-200">Email <span className="text-blue-400">*</span></label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" required className="w-full border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-200">Password <span className="text-blue-400">*</span></label>
                <div className="relative">
                  <Input id="password" type={isPasswordVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full border-slate-700 bg-slate-800 pr-10 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500" />
                  <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)} className="pt-2">
                <Button
                  type="submit"
                  className={cn("relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 py-2 text-white transition-all duration-300 hover:from-blue-600 hover:to-indigo-700", isHovered ? "shadow-lg shadow-blue-200" : "")}
                  disabled={loading}
                >
                  <span className="flex items-center justify-center">Sign in<ArrowRight className="ml-2 h-4 w-4" /></span>
                  {isHovered && (
                    <Motion.span initial={{ left: "-100%" }} animate={{ left: "100%" }} transition={{ duration: 1, ease: "easeInOut" }} className="absolute bottom-0 left-0 top-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ filter: "blur(8px)" }} />
                  )}
                </Button>
              </Motion.div>
              {errorMessage ? (
                <p className="text-sm text-rose-400">{errorMessage}</p>
              ) : null}
              <div className="mt-6 flex flex-col items-center gap-3 text-center">
                <button
                  type="button"
                  onClick={() => onForgotPassword?.()}
                  className="text-sm text-blue-300 transition-colors hover:text-blue-200"
                >
                  Forgot password?
                </button>
                {onBackToLanding ? (
                  <button
                    type="button"
                    onClick={onBackToLanding}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                    Back to landing page
                  </button>
                ) : null}
              </div>
            </form>
          </Motion.div>
        </div>
      </Motion.div>
    </div>
  );
};

const Index = (props) => {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-transparent p-4">
      <SignInCard {...props} />
    </div>
  );
};

export default Index;
