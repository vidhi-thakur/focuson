import "./NoData.css";
export const NoData = ({ message }: { message: string }) => {
  return (
    <div className="noData">
      <div className="noDataContent">
        <img src="assets/NoData.png" alt="No data" height={60} width={60} />
        <p>{message}</p>
      </div>
    </div>
  );
};
