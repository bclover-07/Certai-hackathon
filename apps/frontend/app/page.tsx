'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ProblemSection from '../components/landing/ProblemSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import RolesSection from '../components/landing/RolesSection';
import SandboxSection from '../components/landing/SandboxSection';
import StatsSection from '../components/landing/StatsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';

const HeroSection = dynamic(() => import('../components/landing/HeroSection'), {
  ssr: false,
});

export default function LandingPage() {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  return (
    <main style={{ background: '#030508', overflowX: 'hidden' }}>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <SandboxSection />
      <FeaturesSection />
      <RolesSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
}
