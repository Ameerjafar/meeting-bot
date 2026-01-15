import zod from 'zod';

export const SignUpValidation = zod.object({
    fullName: zod.string(),
    email: zod.email(),
    password: zod.string().min(6)
})

export const SignInValidation = zod.object({
    email: zod.email(),
    password: zod.string().min(6)
})