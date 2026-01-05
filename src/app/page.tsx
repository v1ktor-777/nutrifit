"use client";

import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "Fitness Program",
      description: "Personalized workout routines and structured training plans.",
      href: "/program",
    },
    {
      title: "Food Log",
      description: "Track meals, calories and nutritional intake on a daily basis.",
      href: "/food",
    },
    {
      title: "Progress Tracking",
      description: "Monitor body metrics, training consistency and long-term progress.",
      href: "/progress",
    },
  ];

  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="container max-w-4xl mx-auto px-4 pt-12 md:pt-20">
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Nutri<span className="text-accent">Fit</span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
              A clean and practical platform for training programs, nutrition tracking
              and fitness progress monitoring.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="btn-primary w-full sm:w-auto px-10 py-3.5 text-base font-medium"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="btn-secondary w-full sm:w-auto px-10 py-3.5 text-base font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container max-w-6xl mx-auto px-4">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold">Core Features</h2>
            <p className="text-muted max-w-xl mx-auto text-lg">
              Everything you need to build consistency and track your fitness journey.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Link key={feature.href} href={feature.href} className="group">
                <div className="card h-full p-6 transition-all duration-300 hover:shadow-lg border border-border">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick access */}
      <section className="container max-w-4xl mx-auto px-4">
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-center">Quick Access</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/dashboard"
              className="card text-center p-5 hover:border-accent/30 transition-all duration-300 border border-border"
            >
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/program"
              className="card text-center p-5 hover:border-accent/30 transition-all duration-300 border border-border"
            >
              <span className="font-medium">My Program</span>
            </Link>
            <Link
              href="/progress"
              className="card text-center p-5 hover:border-accent/30 transition-all duration-300 border border-border"
            >
              <span className="font-medium">Progress</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-3xl mx-auto px-4 pb-16">
        <div className="card text-center p-8 md:p-10 space-y-6 border border-border">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Start building better habits today
            </h2>
            <p className="text-muted max-w-xl mx-auto leading-relaxed">
              NutriFit helps you stay consistent by combining training, nutrition
              and progress tracking in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="btn-primary w-full sm:w-auto px-10 py-3.5 font-medium"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="btn-secondary w-full sm:w-auto px-10 py-3.5 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}