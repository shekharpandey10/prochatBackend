export interface SignUpBody {
  first_name: string;

  last_name: string;

  email: string;

  password: string;
}

export interface TokanPayload{
    email:string,
    userId:string
}


declare global{
    namespace Express{
        interface Request{
            user?:TokanPayload
        }
    }
}