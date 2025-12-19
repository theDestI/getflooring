import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileText, Plus, Database, Settings, Hammer, Ruler, Grid3X3, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen blueprint-grid">
      {/* Decorative corner elements */}
      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none">
        <svg className="w-full h-full text-[var(--amber)] opacity-20" viewBox="0 0 100 100">
          <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="currentColor"/>
        </svg>
      </div>
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none rotate-180">
        <svg className="w-full h-full text-[var(--amber)] opacity-20" viewBox="0 0 100 100">
          <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="currentColor"/>
        </svg>
      </div>

      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--amber)] to-[var(--copper)] flex items-center justify-center workshop-shadow-sm">
                <Hammer className="h-5 w-5 text-[var(--primary-foreground)]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-display tracking-tight">FloorCraft Studio</h1>
                <p className="text-xs text-[var(--muted-foreground)] font-mono">Professional Estimates</p>
              </div>
            </div>
            <nav className="flex items-center gap-2 animate-fade-in delay-100">
              <Link href="/data-sources">
                <Button variant="ghost" className="text-sm hover:bg-[var(--amber)]/10 hover:text-[var(--amber)]">
                  <Database className="h-4 w-4 mr-2" />
                  Data Sources
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" className="text-sm hover:bg-[var(--amber)]/10 hover:text-[var(--amber)]">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <div className="w-px h-6 bg-[var(--border)]" />
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 animate-fade-in-up">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-[var(--amber)] font-mono text-sm mb-2 tracking-widest uppercase">Your Workspace</p>
              <h2 className="text-4xl font-bold text-display tracking-tight">
                <span className="text-gradient">Templates</span>
              </h2>
            </div>
            <Link href="/editor">
              <Button className="bg-gradient-to-r from-[var(--amber)] to-[var(--copper)] hover:from-[var(--copper)] hover:to-[var(--amber)] text-[var(--primary-foreground)] font-semibold workshop-shadow group">
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                New Template
                <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Button>
            </Link>
          </div>
          <p className="text-[var(--muted-foreground)] text-lg max-w-xl">
            Craft professional PDF estimates with precision. Each template is your blueprint for success.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Create new template card */}
          <Link href="/editor" className="animate-fade-in-up delay-200">
            <Card className="group h-full border-dashed border-2 border-[var(--border)] hover:border-[var(--amber)]/50 bg-transparent hover:bg-[var(--card)]/50 transition-all duration-300 interactive-card">
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--amber)]/20 to-[var(--copper)]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-[var(--amber)]/20">
                  <Plus className="h-8 w-8 text-[var(--amber)] group-hover:rotate-90 transition-transform duration-500" />
                </div>
                <h3 className="font-semibold text-lg text-display mb-2">Create Template</h3>
                <p className="text-sm text-[var(--muted-foreground)] text-center leading-relaxed">
                  Start with a blank canvas and build your perfect estimate layout
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Sample template card */}
          <div className="animate-fade-in-up delay-300">
            <Card className="group h-full bg-[var(--card)] border-[var(--border)] hover:border-[var(--amber)]/30 transition-all duration-300 interactive-card workshop-shadow-sm overflow-hidden">
              <CardHeader className="pb-4">
                <div className="h-36 bg-gradient-to-br from-[var(--secondary)] to-[var(--muted)] rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                  {/* Blueprint pattern overlay */}
                  <div className="absolute inset-0 opacity-30">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[var(--amber)]"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                  <FileText className="h-14 w-14 text-[var(--amber)] relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-display">Flooring Estimate</CardTitle>
                    <CardDescription className="mt-1">
                      Professional template for flooring projects
                    </CardDescription>
                  </div>
                  <span className="px-2 py-1 text-xs font-mono bg-[var(--amber)]/10 text-[var(--amber)] rounded">v1.0</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-[var(--border)] hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors">
                    <Ruler className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button size="sm" className="flex-1 bg-[var(--amber)] hover:bg-[var(--copper)] text-[var(--primary-foreground)]">
                    <Grid3X3 className="h-3.5 w-3.5 mr-1.5" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coming soon placeholder */}
          <div className="animate-fade-in-up delay-400">
            <Card className="h-full bg-[var(--card)]/30 border-[var(--border)]/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <div className="h-16 w-16 rounded-2xl bg-[var(--muted)]/50 flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-[var(--muted-foreground)]/50" />
                </div>
                <p className="text-sm text-[var(--muted-foreground)]/70 text-center">
                  More templates coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="animate-fade-in-up delay-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
            <span className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-widest">Quick Access</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/data-sources" className="group">
              <Card className="bg-[var(--card)] border-[var(--border)] hover:border-[var(--amber)]/30 transition-all duration-300 workshop-shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Database className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-display mb-1 group-hover:text-[var(--amber)] transition-colors">Data Sources</h3>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        Connect HubSpot, APIs, or spreadsheets
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/history" className="group">
              <Card className="bg-[var(--card)] border-[var(--border)] hover:border-[var(--amber)]/30 transition-all duration-300 workshop-shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-display mb-1 group-hover:text-[var(--amber)] transition-colors">Generated PDFs</h3>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        View and download your documents
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/settings" className="group">
              <Card className="bg-[var(--card)] border-[var(--border)] hover:border-[var(--amber)]/30 transition-all duration-300 workshop-shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--amber)]/20 to-[var(--copper)]/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Settings className="h-6 w-6 text-[var(--amber)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-display mb-1 group-hover:text-[var(--amber)] transition-colors">Settings</h3>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        Configure your workspace preferences
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Footer accent */}
        <div className="mt-20 flex items-center justify-center animate-fade-in delay-700">
          <div className="flex items-center gap-4 text-[var(--muted-foreground)]/50 text-xs font-mono">
            <span>Precision</span>
            <div className="w-1 h-1 rounded-full bg-[var(--amber)]/50" />
            <span>Craft</span>
            <div className="w-1 h-1 rounded-full bg-[var(--amber)]/50" />
            <span>Excellence</span>
          </div>
        </div>
      </main>
    </div>
  );
}
