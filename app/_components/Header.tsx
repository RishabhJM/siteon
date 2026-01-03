import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { SignInButton } from '@clerk/nextjs'


const MenuOption = [
    {
        "name": "Pricing",
        "path": "/pricing"
    },  
    {
        "name": "Contact us",
        "path": "/contact"
    }
]

function Header() {
  return (
    <div className='flex justify-between items-center p-4 shadow h-[10vh]'>
        <div className='flex gap-2 items-center'>
            <Image src={"/logo.svg"} alt="Logo" width={48} height={48}/>
            <h2 className="font-bold text-xl">Siteon</h2>
        </div>
        <div className='flex gap-2 items-center'>
            {MenuOption.map((option,index) => (
                <Button key={index} variant="ghost">
                    <Link href={option.path}>{option.name}</Link>
                </Button>
            ))}
        </div>
        <div>
            <SignInButton mode="redirect" forceRedirectUrl={"/workspace"}>
            <Link href="/workspace">
                <Button>Get Started <ArrowRight/></Button>
            </Link>
            </SignInButton>
        </div>
    </div>
  )
}

export default Header