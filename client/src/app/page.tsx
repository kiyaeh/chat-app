'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Zap, Shield, Users, Server, Database } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <MessageSquare className="w-8 h-8 text-blue-400" />
            ChatApp
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-blue-400 transition">
              Login
            </Link>
            <Link href="/register" className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Enterprise-Grade Chat System
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Built with microservices architecture for scalability, reliability, and real-time communication.
            Powered by NestJS, PostgreSQL, and WebSocket technology.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="bg-blue-600 px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
              Start Chatting
            </Link>
            <button className="border border-slate-400 px-8 py-3 rounded-lg hover:bg-slate-800 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-20 px-6 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">Microservices Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Auth Service', desc: 'JWT authentication & security', port: '3001' },
              { icon: Users, title: 'User Service', desc: 'Profile management & status', port: '3002' },
              { icon: MessageSquare, title: 'Room Service', desc: 'Chat rooms & memberships', port: '3003' },
              { icon: Database, title: 'Message Service', desc: 'Message CRUD & history', port: '3004' },
              { icon: Zap, title: 'WebSocket Service', desc: 'Real-time messaging', port: '3007' },
              { icon: Server, title: 'API Gateway', desc: 'Request routing & load balancing', port: '8080' },
            ].map((service, idx) => (
              <div key={idx} className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 hover:border-blue-400 transition">
                <service.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-slate-300 mb-3">{service.desc}</p>
                <span className="text-sm text-blue-400 font-mono">Port {service.port}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { title: 'Real-Time Messaging', desc: 'Instant message delivery with WebSocket technology' },
              { title: 'Scalable Architecture', desc: 'Independent microservices for horizontal scaling' },
              { title: 'Secure Authentication', desc: 'JWT-based authentication with Passport integration' },
              { title: 'Message History', desc: 'Persistent storage with PostgreSQL database' },
              { title: 'User Management', desc: 'Complete user profiles and status management' },
              { title: 'Room Management', desc: 'Create, join, and manage chat rooms' },
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-1 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-300">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'NestJS', category: 'Backend Framework' },
              { name: 'TypeScript', category: 'Language' },
              { name: 'PostgreSQL', category: 'Database' },
              { name: 'Prisma', category: 'ORM' },
              { name: 'Socket.IO', category: 'Real-time' },
              { name: 'Redis', category: 'Cache' },
              { name: 'Next.js', category: 'Frontend' },
              { name: 'Docker', category: 'Containerization' },
            ].map((tech, idx) => (
              <div key={idx} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center hover:border-blue-400 transition">
                <p className="font-semibold text-lg">{tech.name}</p>
                <p className="text-sm text-slate-400">{tech.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Enterprise Chat?</h2>
          <p className="text-slate-300 mb-8">Join thousands of users enjoying seamless real-time communication.</p>
          <Link href="/register" className="bg-blue-600 px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold inline-block">
            Create Account Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 px-6 text-center text-slate-400">
        <p>&copy; 2024 ChatApp. Enterprise-grade microservices chat system.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
