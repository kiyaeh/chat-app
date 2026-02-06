'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateField = useCallback((name: string, value: string): string | undefined => {
    switch (name) {
      case 'username':
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, underscores, and hyphens';
        return undefined;
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return undefined;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
      default:
        return undefined;
    }
  }, []);

  const passwordStrength = useMemo((): PasswordStrength => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z\d]/.test(pwd)) score++;

    const strengths: PasswordStrength[] = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: 'bg-red-500' },
      { score: 2, label: 'Fair', color: 'bg-orange-500' },
      { score: 3, label: 'Good', color: 'bg-yellow-500' },
      { score: 4, label: 'Strong', color: 'bg-lime-500' },
      { score: 5, label: 'Very Strong', color: 'bg-green-500' },
    ];

    return strengths[Math.min(score, 5)];
  }, [formData.password]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    setFocusedField(null);
  }, [validateField]);

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key as keyof FormErrors] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ username: true, email: true, password: true });
      return;
    }

    try {
      await register(formData.email, formData.password, formData.username);
      router.push('/chat');
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const isFormValid = 
    formData.username && formData.email && formData.password &&
    !errors.username && !errors.email && !errors.password &&
    passwordStrength.score >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-16 border border-white/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <span className="text-4xl">💬</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Join Chat</h1>
            <p className="text-slate-600 text-base">Create your account to get started</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-10 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Username Field */}
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
              <label htmlFor="username" className="block text-sm font-semibold text-slate-900">
                Username
              </label>
              <div className="relative group">
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="john_doe"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('username')}
                  aria-invalid={!!errors.username && touched.username}
                  className={`w-full h-14 px-5 rounded-xl border-2 transition-all duration-300 focus:outline-none text-base bg-slate-50 ${
                    errors.username && touched.username
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : focusedField === 'username'
                      ? 'border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-lg'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  }`}
                />
                {formData.username && !errors.username && touched.username && (
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500 text-lg animate-in fade-in duration-200">✓</span>
                )}
              </div>
              {errors.username && touched.username && (
                <p className="text-red-600 text-xs font-medium mt-2 animate-in fade-in duration-200">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-900">
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('email')}
                  aria-invalid={!!errors.email && touched.email}
                  className={`w-full h-14 px-5 rounded-xl border-2 transition-all duration-300 focus:outline-none text-base bg-slate-50 ${
                    errors.email && touched.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : focusedField === 'email'
                      ? 'border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-lg'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  }`}
                />
                {formData.email && !errors.email && touched.email && (
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500 text-lg animate-in fade-in duration-200">✓</span>
                )}
              </div>
              {errors.email && touched.email && (
                <p className="text-red-600 text-xs font-medium mt-2 animate-in fade-in duration-200">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-250">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('password')}
                  aria-invalid={!!errors.password && touched.password}
                  className={`w-full h-14 px-5 pr-14 rounded-xl border-2 transition-all duration-300 focus:outline-none text-base bg-slate-50 ${
                    errors.password && touched.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : focusedField === 'password'
                      ? 'border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-lg'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition text-lg hover:scale-110 duration-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️🗨️'}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                          i < passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.label && (
                    <p className={`text-xs font-semibold transition-colors duration-300 ${
                      passwordStrength.score >= 3 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      Strength: {passwordStrength.label}
                    </p>
                  )}
                </div>
              )}

              {errors.password && touched.password && (
                <p className="text-red-600 text-xs font-medium mt-2 animate-in fade-in duration-200">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              isLoading={isLoading}
              variant="primary"
              size="lg"
              fullWidth
              className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300"
            >
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="my-10 flex items-center gap-3 animate-in fade-in duration-500 delay-350">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Footer */}
          <p className="text-center text-slate-600 text-sm animate-in fade-in duration-500 delay-350">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Security text */}
        <p className="text-center text-slate-400 text-xs mt-10 animate-in fade-in duration-500 delay-400">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
};
