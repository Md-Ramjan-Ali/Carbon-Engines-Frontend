import Link from 'next/link';
import React from 'react'


export default function Navbar() {
  return (
    <div className="h-[10vh] flex justify-center items-center bg-black text-white gap-3 ">
      <Link href="/" className=" hover:underline">
        Home
      </Link>
      <Link href="/login" className=" hover:underline">
        Login
      </Link>
      <Link href="/signup" className=" hover:underline">
        Signup
      </Link>
    </div>
  );
}