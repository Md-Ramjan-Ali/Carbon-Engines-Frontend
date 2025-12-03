// 'use client';
// import { useRef } from 'react';

// const otpInput = ({ length = 4, onChange }) => {
//     const refs = Array.from({ length }, () => useRef());


//     function handleInput(e, idx) {
//         const value = e.target.value.replace(/[^0-9]/g, '');
//         if (value.length > 1) return;
//         e.target.value = value;
//         onChange && onChange(Array.from(refs, r => r.current?.value || '').join(''));
//         if (value && idx < length - 1) refs[idx + 1].current.focus();
//     }
//     return (
//         <div className="flex gap-2">
//             {refs.map((r, i) => (
//                 <input
//                     key={i}
//                     ref={r}
//                     onChange={(e) => handleInput(e, i)}
//                     className="w-12 h-12 text-center rounded border"
//                     maxLength={1}
//                     inputMode="numeric"
//                     pattern="[0-9]*"
//                 />
//             ))}
//         </div>
//     )
// }

// export default otpInput
