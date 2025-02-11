import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, KeenIcon } from '@/components';
import { useAuthContext } from '@/auth';
import { useState } from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useLayout } from '@/providers';
import { AxiosError } from 'axios';

const resetPasswordSchema = Yup.object().shape({
  email: Yup.string()
  .required("Email is required").email('Invalid email address'),
  newPassword: Yup.string().required("Password is required").matches(/^(?=.*\d)[A-Za-z\d]{8,}$/, 'Your password must contain both letters and numbers and the Minimum length should be 8 characters.',
  ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
  otp: Yup.string()
    .required('OTP is required'),
});

const ResetPasswordChange = () => {
  const { currentLayout } = useLayout();
  const { resetPassword } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirmation, setShowNewPasswordConfirmation] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      newPassword: '',
      confirmPassword: '',
      otp: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      const updatedValues = {
        email: values.email, 
        password: values.newPassword,
        passwordConfirm: values.confirmPassword, 
        otp: `${values.otp}`,
      }
      setLoading(true);
      setHasErrors(undefined);

      try {
        if(resetPassword){ 
          await resetPassword(updatedValues.email, updatedValues.password, updatedValues.passwordConfirm, updatedValues.otp);
          setHasErrors(false);
          navigate(
            '/auth/reset-password/changed'
          );
        }
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          setStatus(error.response.data.message);
        } else {
          setStatus('Password reset failed. Please try again.');
        }
        setHasErrors(true);
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
        </div>

        {hasErrors && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Email</label>
          <label className="input">
            <input
              type='email'
              placeholder="Enter your email"
              autoComplete="off"
              {...formik.getFieldProps('email')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.email && formik.errors.email },
                { 'is-valid': formik.touched.email  && !formik.errors.email }
              )}
            />
          </label>
          {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">New Password</label>
          <label className="input">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter a new password"
              autoComplete="off"
              {...formik.getFieldProps('newPassword')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.newPassword && formik.errors.newPassword },
                { 'is-valid': formik.touched.newPassword && !formik.errors.newPassword }
              )}
            />
            <button
              className="btn btn-icon"
              onClick={(e) => {
                e.preventDefault();
                setShowNewPassword(!showNewPassword);
              }}
            >
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showNewPassword })} />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showNewPassword })}
              />
            </button>
          </label>
          {formik.touched.newPassword && formik.errors.newPassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.newPassword}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label font-normal text-gray-900">Confirm New Password</label>
          <label className="input">
            <input
              type={showNewPasswordConfirmation ? 'text' : 'password'}
              placeholder="Re-enter a new Password"
              autoComplete="off"
              {...formik.getFieldProps('confirmPassword')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.confirmPassword && formik.errors.confirmPassword },
                { 'is-valid': formik.touched.confirmPassword && !formik.errors.confirmPassword }
              )}
            />
            <button
              className="btn btn-icon"
              onClick={(e) => {
                e.preventDefault();
                setShowNewPasswordConfirmation(!showNewPasswordConfirmation);
              }}
            >
              <KeenIcon
                icon="eye"
                className={clsx('text-gray-500', { hidden: showNewPasswordConfirmation })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showNewPasswordConfirmation })}
              />
            </button>
          </label>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.confirmPassword}
            </span>
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">OTP</label>
          <label className="input">
            <input
              type={'number'}
              placeholder="Enter your OTP"
              autoComplete="off"
              {...formik.getFieldProps('otp')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.otp && formik.errors.otp },
                { 'is-valid': formik.touched.otp  && !formik.errors.otp }
              )}
            />
          </label>
          {formik.touched.otp && formik.errors.otp && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.otp}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading}
        >
          {loading ? 'Please wait...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export { ResetPasswordChange };