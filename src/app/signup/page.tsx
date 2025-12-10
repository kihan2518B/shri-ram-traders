"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { MessageBox } from "@/components/MessageBox";
import toast from "react-hot-toast";

// Custom Message Component
interface Message {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

export default function Signup() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [message, setMessage] = useState<Message | null>(null)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()

      if (result.success) {
        toast.success(result.message || 'Signup successful!')
        router.push("/login")
      } else {
        toast.error(result.message || 'Signup failed.')
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-navy-800">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our wholesale management system
          </p>
        </div>

        {message && (
          <MessageBox
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        )}

        <form className="mt-8 space-y-6" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSubmit(formData);
        }}>
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-navy-900 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-navy-900 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition duration-150 ease-in-out"
            >
              Sign Up
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <a href="/login" className="font-medium text-navy-600 hover:text-navy-500">
              Sign in here
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}