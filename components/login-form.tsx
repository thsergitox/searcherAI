import { Eye, EyeClosed } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

  
export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)


    return (
        <div className=" border-t-8 rounded-sm border-important bg-primary-foreground p-12 shadow-2xl w-96">
          <h1 className="font-bold text-primary block text-2xl">Sign Up</h1>
          <p className="text-muted-foreground text-xs mb-4">Necesita crear una cuenta para ver su Survey Paper</p>
          <form className="flex flex-col items-center gap-4">
          <Input type="email" id="email" name="email" placeholder="e.g: me@gmail.com" autoFocus={true}/>
          <div className="flex relative w-full">
            <Input className='mb-4 w-full' type={showPassword ? 'text' : 'password'} id="password" name="password"  placeholder="••••••••••" />
            <div className="absolute right-2 bottom-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeClosed size={16} strokeWidth={2} className="stroke-primary" /> : <Eye size={16} strokeWidth={2} className="stroke-primary"/>}
            </div>
          </div>
          <Button value="Submit" variant={"important"} className="h-10 rounded-md px-8 w-full"> Iniciar sesión </Button>
          </form>
        </div>
    )
}

