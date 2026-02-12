import { AppButton } from '../../shared/componenst/AppButton/AppButton';
import { useGetTestCustomerQuery } from './customersApi';
import RefreshIcon from '@mui/icons-material/Refresh';

export const CustomerList = () => {
  // refetch - функція для примусового запиту
  // isFetching - стає true при кожному запиті (навіть якщо дані вже є в кеші)
  const { data, error, isLoading, isFetching, refetch } = useGetTestCustomerQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="error-msg">Network error</div>;
  if (!data) return null;

  return (
    <div className="customer-card">
      <div className="customer-card__header">
        <h3>Nodes monitoring</h3>
        <AppButton 
          variant="contained" 
          color="primary" 
          onClick={() => refetch()} 
          loading={isFetching}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </AppButton>
      </div>

      <div className="customer-card__content">
        <div className={`status-badge ${data.servedBy.toLowerCase().replace('_', '-')}`}>
          {data.servedBy}
        </div>
        <p className="message">{data.message}</p>
        <span className="timestamp">Last response at: {new Date(data.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};