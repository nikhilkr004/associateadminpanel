import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Associate Admin
            </span>
          </div>
          <Link to="/login">
            <Button variant="outline" className="font-medium hover:bg-primary/5">
              <Lock className="w-4 h-4 mr-2" />
              Secure Login
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Admin System v2.0 Live
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-8 max-w-4xl mx-auto leading-[1.1]">
              Empower Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-primary">
                Administration
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              The ultimate control center for managing associates, monitoring bookings, and scaling your operations with real-time insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
              <Link to="/login">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                  Access Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base hover:bg-muted/50">
                  View Components
                </Button>
              </Link>
            </div>

            {/* Stats Preview */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-border/50 pt-10">
              {[
                { label: 'Active Users', value: '10k+' },
                { label: 'Daily Bookings', value: '500+' },
                { label: 'Advisors', value: '150+' },
                { label: 'Uptime', value: '99.9%' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Powerful Management Tools</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage your platform effectively, from user oversight to financial reporting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Users,
                  title: 'User & Advisor Control',
                  description: 'Comprehensive management of all user roles. Verify advisors, manage permissions, and oversee user activity.',
                  color: 'text-blue-500',
                  bg: 'bg-blue-500/10'
                },
                {
                  icon: LayoutDashboard,
                  title: 'Booking Operations',
                  description: 'Streamlined booking flows. View upcoming appointments, manage schedules, and handle cancellations effortlessly.',
                  color: 'text-primary',
                  bg: 'bg-primary/10'
                },
                {
                  icon: BarChart3,
                  title: 'Advanced Analytics',
                  description: 'Deep insights into platform performance. Track revenue, user growth, and engagement metrics in real-time.',
                  color: 'text-violet-500',
                  bg: 'bg-violet-500/10'
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 rounded-3xl p-8 md:p-12 border border-primary/10 text-center">
              <div className="bg-background inline-flex p-3 rounded-full shadow-sm mb-6">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Ready to scale your operations?</h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
                Join the administration team and help maintain a secure, efficient environment for our growing community.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Secure Infrastructure
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  24/7 Monitoring
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Role-Based Access
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">Associate Admin Panel</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Admin Operations. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
