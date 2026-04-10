import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff, UserPlus } from "lucide-react";
import { motion as m } from "framer-motion";

const Motion = m;

const ROUTES = [
  { start: { x: 100, y: 150, delay: 0 }, end: { x: 200, y: 80, delay: 2 }, color: "#2563eb" },
  { start: { x: 200, y: 80, delay: 2 }, end: { x: 260, y: 120, delay: 4 }, color: "#2563eb" },
  { start: { x: 50, y: 50, delay: 1 }, end: { x: 150, y: 180, delay: 3 }, color: "#2563eb" },
  { start: { x: 280, y: 60, delay: 0.5 }, end: { x: 180, y: 180, delay: 2.5 }, color: "#2563eb" },
];

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Button = ({ children, className = "", ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-md border bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-offset-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
);

const DotMap = () => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

    const dots = [];
    for (let x = 0; x < dimensions.width; x += 12) {
      for (let y = 0; y < dimensions.height; y += 12) {
        if (Math.random() > 0.65) dots.push({ x, y, opacity: Math.random() * 0.5 + 0.2 });
      }
    }

    let animationFrameId;
    let startTime = Date.now();
    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${dot.opacity})`;
        ctx.fill();
      });
      const currentTime = (Date.now() - startTime) / 1000;
      ROUTES.forEach((route) => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;
        const progress = Math.min(elapsed / 3, 1);
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;
        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
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

const TravelConnectSignup = ({
  onSubmit,
  onNavigateLogin,
  loading = false,
  errorMessage = "",
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-transparent p-4">
      <Motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        <div className="relative hidden h-[600px] w-1/2 overflow-hidden border-r border-slate-800 md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
            <DotMap />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8">
              <Motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mb-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
              </Motion.div>
              <Motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-center text-3xl font-bold text-transparent"
              >
                Connectly
              </Motion.h2>
              <Motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="max-w-xs text-center text-sm text-slate-300"
              >
                Create your workspace and keep every conversation, file, and idea in sync.
              </Motion.p>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col justify-center bg-slate-900 p-8 md:w-1/2 md:p-10">
          <h1 className="mb-1 text-2xl font-bold text-slate-100 md:text-3xl">Create account</h1>
          <p className="mb-8 text-slate-400">Start collaborating in minutes</p>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit?.({ displayName, email, password });
            }}
          >
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              className="w-full border-slate-700 bg-slate-800"
            />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full border-slate-700 bg-slate-800"
            />
            <div className="relative">
              <Input
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                minLength={6}
                required
                className="w-full border-slate-700 bg-slate-800 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errorMessage ? <p className="text-sm text-rose-400">{errorMessage}</p> : null}
            <Motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="pt-2"
            >
              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "relative w-full overflow-hidden rounded-lg py-2",
                  isHovered ? "shadow-lg shadow-blue-200" : "",
                )}
              >
                <span className="flex items-center justify-center">
                  Create account
                  <UserPlus className="ml-2 h-4 w-4" />
                </span>
                {isHovered && (
                  <Motion.span
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 top-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{ filter: "blur(8px)" }}
                  />
                )}
              </Button>
            </Motion.div>
            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => onNavigateLogin?.()}
                className="font-medium text-blue-300 hover:text-blue-200"
              >
                Login
              </button>
            </p>
          </form>
        </div>
      </Motion.div>
    </div>
  );
};

export default TravelConnectSignup;
