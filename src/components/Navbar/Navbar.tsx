import Link from 'next/link';
import React from 'react'


export default function Navbar() {
  return (
    <div className="flex justify-center gap-3 mt-4 mb-4">
      <Link href="/" className=" hover:underline">
        Home
      </Link>
      <Link href="/login" className=" hover:underline">
        Login
      </Link>
      <Link href="/" className=" hover:underline">
        Signup
      </Link>
    </div>
  );
}