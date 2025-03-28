'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'
import { useAuth } from '@core/contexts/AuthContext'

import AuthIllustrationWrapper from '../AuthIllustrationWrapper'

const Login = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  })

  const { signIn } = useAuth()
  const router = useRouter()

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: ''
    }

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)

    return !newErrors.email && !newErrors.password
  }

  const handleClickLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await signIn(email, password)
      router.push('/home')
    } catch (error) {
      console.error('Error signing in:', error)
      setErrors(prev => ({
        ...prev,
        email: 'Invalid email or password'
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setErrors(prev => ({ ...prev, email: '' }))
  }

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setErrors(prev => ({ ...prev, password: '' }))
  }

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px] '>
        <CardContent className='sm:!p-12'>
          <div className='flex justify-center mbe-6'>
            <Logo />
          </div>
          <div className='flex flex-col gap-1 mbe-6'>
            <Typography variant='h4' className='font-bold'>{`Welcome to Scriptor!👋🏻`}</Typography>
            <Typography>Please sign-in to your account and start the adventure.</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={e => handleClickLogin(e)} className='flex flex-col gap-6'>
            <CustomTextField
              autoFocus
              fullWidth
              label='Email'
              placeholder='Enter your email'
              value={email}
              onChange={handleChangeEmail}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading}
            />
            <CustomTextField
              fullWidth
              label='Password'
              placeholder='············'
              id='outlined-adornment-password'
              value={password}
              onChange={handleChangePassword}
              type={isPasswordShown ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                      <i className={isPasswordShown ? 'bx-hide' : 'bx-show'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel control={<Checkbox disabled={isLoading} />} label='Remember me' />
              <Typography
                className='text-end'
                color='primary'
                component={Link}
                href={'/forgot-password'}
                sx={{ pointerEvents: isLoading ? 'none' : 'auto' }}
              >
                Forgot password?
              </Typography>
            </div>
            <Button
              fullWidth
              variant='contained'
              type='submit'
              disabled={!!errors.email || !!errors.password || isLoading}
              sx={{
                position: 'relative',
                minHeight: '36px'
              }}
            >
              {isLoading ? (
                <CircularProgress
                  size={24}
                  sx={{
                    color: 'inherit',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px'
                  }}
                />
              ) : (
                'Login'
              )}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>New on our platform?</Typography>
              <Typography
                component={Link}
                color='primary'
                href={'/register'}
                sx={{ pointerEvents: isLoading ? 'none' : 'auto' }}
              >
                Create an account
              </Typography>
            </div>
            <Divider className='gap-2 text-textPrimary'>or</Divider>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default Login
