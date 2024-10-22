import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import { ROUTE } from '../common/constant';
import { Ticket } from '../common/interfaces/ticket.interface';
import { useCurrentUser } from '../hooks/use-current-user';
import { useLogout } from '../hooks/use-logout';

const TicketListPage = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();

  const headers = {
    Authorization: `Bearer ${currentUser?.accessToken}`,
  };

  const { logout } = useLogout();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (ticket: Ticket) => {
    router.push(`${ROUTE.TICKET}/${ticket.id}`);
  };

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Tickets`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) throw new Error('Failed to fetch Tickets');

      const result = await response.json();

      setTickets(result || []);
    } catch (error: unknown) {
      if (error instanceof Error) setError(error.message || 'Error fetching Tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ticketId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) throw new Error('Failed to delete Ticket');

      alert('Delete Ticket success.');

      fetchTickets();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err?.message);
    }
  };

  const actionTemplate = (rowData: Ticket) => {
    return (
      <div>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-mr-2"
          onClick={() => handleEdit(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => handleDelete(rowData.id)}
        />
      </div>
    );
  };

  useEffect(() => {
    if (currentUser) fetchTickets();
  }, [currentUser]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-fluid">
      <div className="flex flex-column gap-3">
        <div className="flex justify-content-between">
          <h2>List Ticket</h2>
          <div className="flex gap-3">
            <div className="flex">
              {currentUser && (
                <Button
                  className="p-button-danger"
                  label="Logout"
                  onClick={() => {
                    logout();
                    router.push({ pathname: ROUTE.LOGIN });
                  }}
                />
              )}
            </div>
            <div className="flex">
              <Button label="Create" type="button" onClick={() => router.push(`${ROUTE.TICKET}/create`)} />
            </div>
          </div>
        </div>
        <DataTable value={tickets} stripedRows tableStyle={{ minWidth: '50rem' }}>
          <Column field="title" header="Title" />
          <Column field="description" header="Description" />
          <Column header="Actions" body={actionTemplate} />
        </DataTable>
      </div>
    </div>
  );
};

export default TicketListPage;
