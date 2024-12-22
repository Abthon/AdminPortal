import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';
import { KeenIcon } from '@/components';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthContext } from '@/auth';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import clsx from 'clsx';
import { Alert } from '@/components';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
});

const initialValues = {
  email: '',
};

const TwoFactorAuth = () => {
  const [codeInputs, setCodeInputs] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const message = location.state?.message;
  const userEmail = location.state?.email; 
  const from = location.state?.from?.pathname || '/auth/login';
  const { varifyAccount } = useAuthContext();
  const navigate  = useNavigate();

  useEffect(()=> {
    if(message){ 
      toast(`Info`, {
        description: `Account created successfully!`,
        action: {
          label: 'Ok',
          onClick: () => console.log('Ok')
        }
      });
    }
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      const code = codeInputs.join('');
      setLoading(true)
      if(values.email && code){
        try {
          if (!varifyAccount) {
            throw new Error('JWTProvider is required for this form.');
          }

          await varifyAccount(values.email, code);
          navigate(from, { replace: true , state: {
            message: 'Account verified successfully',
          } });
        } catch {
          toast(`Warning`, {
            description: `Error occured, Submit your otp code again`,
            action: {
              label: 'Ok',
              onClick: () => console.log('Ok')
            }
          });
        }
      }
      console.log('Submitted code:',code);
      setLoading(false);
    }
  });

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const updatedInputs = [...codeInputs];
    updatedInputs[index] = value;
    setCodeInputs(updatedInputs);
  };

  return (
    <div className="card max-w-[380px] w-full">
      <form className="card-body flex flex-col gap-5 p-10" onSubmit={formik.handleSubmit}>
        <img
          src={toAbsoluteUrl('/media/illustrations/34.svg')}
          className="dark:hidden h-20 mb-2"
          alt=""
        />
        <img
          src={toAbsoluteUrl('/media/illustrations/34-dark.svg')}
          className="light:hidden h-20 mb-2"
          alt=""
        />

        <div className="text-center mb-2">
          <h3 className="text-lg font-medium text-gray-900 mb-5">Verify your phone</h3>
          <div className="flex flex-col">
            <span className="text-2sm text-gray-700 mb-1.5">
              Enter the verification code we sent to
            </span>
            <a href="#" className="text-sm font-medium text-gray-900">
              Your Email
            </a>
          </div>
        </div>

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          {/* <label className="form-label text-gray-900">Email</label> */}
          <label className="input">
            <input
              placeholder="Enter your email"
              autoComplete="off"
              {...formik.getFieldProps('email')}
              className={clsx('form-control', {
                'is-invalid': formik.touched.email && formik.errors.email
              })}
            />
          </label>
          {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          {codeInputs.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="input focus:border-primary-clarity focus:ring focus:ring-primary-clarity size-10 shrink-0 px-0 text-center"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          ))}
        </div>

        {/* <div className="flex items-center justify-center mb-2">
          <span className="text-xs text-gray-700 me-1.5">Didn’t receive a code? (37s)</span>
          <Link to="/auth/classic/login" className="text-xs link">
            Resend
          </Link>
        </div> */}
        {/* <button className="btn btn-primary flex justify-center grow" type='button'>Continue</button> */}
        
        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Please wait...' : 'Verify'}
        </button>
        <Link
          to="/auth/login"
          className="flex items-center justify-center text-sm gap-2 text-gray-700 hover:text-primary"
        >
          <KeenIcon icon="black-left" />
          Back to Login
        </Link>
      </form>
    </div>
  );
};

export { TwoFactorAuth };