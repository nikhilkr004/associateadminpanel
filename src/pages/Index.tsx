import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scissors, LayoutDashboard, Shield, Users, BarChart3, ArrowRight } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-primary">BarberShop</span>
          </div>
          <Link to="/login">
            <Button>Admin Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Secure Admin Panel
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Manage Your Barbershop
            <span className="text-primary block mt-2">With Ease</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            A modern, responsive admin panel built with React and Firebase. 
            Manage clients, services, employees, and appointments all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="gap-2 shadow-lg px-8">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: LayoutDashboard,
              title: 'Intuitive Dashboard',
              description: 'Clean and modern interface with real-time statistics and charts.',
            },
            {
              icon: Users,
              title: 'Client Management',
              description: 'Easily manage your clients, employees, and appointments.',
            },
            {
              icon: BarChart3,
              title: 'Analytics & Reports',
              description: 'Track your business growth with detailed analytics and reports.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl p-6 shadow-card border border-border/50 hover:shadow-elevated transition-shadow duration-300"
            >
              <div className="bg-primary-light w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 BarberShop Admin Panel. Built with React & Firebase.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
