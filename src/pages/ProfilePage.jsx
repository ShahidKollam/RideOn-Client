import { useState } from 'react'
import { Building2, GraduationCap, IdCard, Phone, User } from 'lucide-react'

import AuthLayout from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        studentId: '',
        department: '',
        year: '',
    })

    const updateProfile = (field, value) => {
        setProfile((current) => ({
            ...current,
            [field]: value,
        }))
    }

    const handleCompleteProfile = (e) => {
        e.preventDefault()

        console.log(profile)
    }

    return (
        <AuthLayout showTabs={false} showTerms={false}>
            <form onSubmit={handleCompleteProfile}>
                <div className="text-center">
                    <h1 className="text-[1.75rem] leading-tight font-extrabold text-rideon-dark">
                        Complete Profile
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-slate-500">
                        Add your student details to finish setting up RideOn.
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="relative">
                        <User className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => updateProfile('name', e.target.value)}
                            placeholder="Enter your full name"
                            className="h-12 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-11 text-sm outline-none transition-all focus:border-rideon-blue"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />

                        <input
                            type="tel"
                            inputMode="numeric"
                            value={profile.phone}
                            onChange={(e) => updateProfile('phone', e.target.value)}
                            placeholder="Enter your mobile number"
                            className="h-12 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-11 text-sm outline-none transition-all focus:border-rideon-blue"
                            required
                        />
                    </div>

                    <div className="relative">
                        <IdCard className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            value={profile.studentId}
                            onChange={(e) => updateProfile('studentId', e.target.value)}
                            placeholder="Student ID / Roll Number"
                            className="h-12 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-11 text-sm outline-none transition-all focus:border-rideon-blue"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Building2 className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            value={profile.department}
                            onChange={(e) => updateProfile('department', e.target.value)}
                            placeholder="Department"
                            className="h-12 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-11 text-sm outline-none transition-all focus:border-rideon-blue"
                            required
                        />
                    </div>

                    <div className="relative">
                        <GraduationCap className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />

                        <select
                            value={profile.year}
                            onChange={(e) => updateProfile('year', e.target.value)}
                            className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white pr-4 pl-11 text-sm text-rideon-dark outline-none transition-all focus:border-rideon-blue"
                            required
                        >
                            <option value="">Year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                            <option value="5">5th Year</option>
                        </select>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="mt-6 h-11 w-full rounded-lg bg-rideon-blue font-semibold text-white shadow-[0_4px_14px_rgba(29,140,248,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rideon-blue/90 hover:shadow-[0_12px_28px_rgba(29,140,248,0.35)]"
                >
                    Complete Profile
                </Button>
            </form>
        </AuthLayout>
    )
}
