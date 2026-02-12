import { Button, type ButtonProps, CircularProgress } from '@mui/material';

interface AppButtonProps extends ButtonProps {
  loading?: boolean;
}

export const AppButton = ({ loading, children, ...props }: AppButtonProps) => {
  return (
    <Button 
      {...props} 
      disabled={loading || props.disabled}
      startIcon={loading ? <CircularProgress size={20} /> : props.startIcon}
    >
      {children}
    </Button>
  );
};