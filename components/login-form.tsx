/* eslint-disable @typescript-eslint/no-unused-vars */
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface LoginFormProps{
    onCreateProject: ()=>void
}
  
export default function LoginForm({onCreateProject}: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const fetchLogin = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: email, password: password})
            });

            if(!response.ok){
                const errorData = await response.json();
                console.error(errorData.detail);
                return;
            }

            const token = await response.json();
            document.cookie = `token = ${token.access_token}; path=/`;
            onCreateProject();
            
        } catch (error) {
            console.error(error);
        }
    }

    const fethPostRegister = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({full_name: name,  email: email, password: password})
            });

            if(response.status === 400) {
                // If registration fails with 400, try to login
                return await fetchLogin();
            }

            if(!response.ok){
                const errorData = await response.json();
                console.error(errorData.detail);
                return;
            }

            const token = await response.json();
            document.cookie = `token = ${token.access_token}; path=/`;
            onCreateProject();

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className=" border-t-8 rounded-sm border-important bg-primary-foreground p-12 shadow-2xl w-96">
          <h1 className="font-bold text-primary block text-2xl">Sign Up</h1>
          <p className="text-muted-foreground text-xs mb-4">Necesita crear una cuenta para ver su Survey Paper</p>
          <form className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-start w-full">
            <label htmlFor="name" className="text-xs text-grey">Nombre completo</label>
            <Input type="email" id="name" name="name" placeholder="e.g: Lionel Messi" autoFocus={true} onChange={(e) => setName(e.target.value)}/>
          </div>
          <div className="flex flex-col items-start w-full">
            <label htmlFor="email" className="text-xs text-grey"> Correo electrónico</label>
            <Input type="email" id="email" name="email" placeholder="e.g: me@gmail.com" onChange={(e) => setEmail(e.target.value)}/>
          </div>
          <div className="flex flex-col items-start w-full">
            <label htmlFor="password" className="text-xs text-grey"> Contraseña</label>
            <div className="flex relative w-full">
                <Input className='mb-4 w-full' type={showPassword ? 'text' : 'password'} id="password" name="password"  placeholder="••••••••••" onChange={(e) => setPassword(e.target.value)}/>
                <div className="absolute right-2 bottom-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeClosed size={16} strokeWidth={2} className="stroke-primary" /> : <Eye size={16} strokeWidth={2} className="stroke-primary"/>}
                </div>
            </div>
          </div>
          <Button value="Submit" variant={"important"} className="h-10 rounded-md px-8 w-full" onClick={(e) => {e.preventDefault(); fethPostRegister()}}> Iniciar sesión </Button>
          </form>
        </div>
    )
}

