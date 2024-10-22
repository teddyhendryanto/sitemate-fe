import { yupResolver } from '@hookform/resolvers/yup';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';
import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { DetailTicketResponse, Ticket } from '../../common/interfaces/ticket.interface';
import { useCurrentUser } from '../../hooks/use-current-user';

const schema = yup
  .object({
    title: yup.string(),
    description: yup.string(),
  })
  .required();

export type UpdateTicketInput = yup.InferType<typeof schema>;

const TicketDetailPage: NextPage = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { id } = router.query;
  const [ticket, setTicket] = useState<Ticket>();
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<UpdateTicketInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: ticket?.title,
      description: ticket?.description,
    },
  });

  const { handleSubmit, control, reset } = methods;

  // Fetch ticket details
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${id}/detail`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${currentUser?.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch ticket details');

        const data = (await response.json()) as DetailTicketResponse;

        setTicket(data);
        reset(data);
      } catch (error: unknown) {
        if (error instanceof Error) setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && id) {
      fetchTicketDetails();
    }
  }, [currentUser, id, reset]);

  const onSubmitHandler: SubmitHandler<UpdateTicketInput> = async (formData) => {
    setLoadingSubmit(true);
    setSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${currentUser?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      if (!response.ok) throw new Error('Failed to update ticket');

      setSuccess(true);

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: unknown) {
      setSuccess(false);
      if (error instanceof Error) setError(error.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  useEffect(() => {
    reset(ticket);
  }, [ticket]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-fluid">
      <h2>Edit Ticket</h2>
      {success && <Message severity="success" text="Ticket updated" />}
      {error && <Message severity="error" text={error} />}
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="flex flex-column gap-3">
          <div className="p-field">
            <label htmlFor="title">Title</label>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required.' }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  autoFocus
                  required
                  className={classNames({
                    'p-invalid': fieldState.invalid,
                  })}
                />
              )}
            />
          </div>
          <div className="p-field">
            <label htmlFor="description">Description</label>
            <Controller
              name="description"
              control={control}
              rules={{ required: 'Description is required.' }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  required
                  className={classNames({
                    'p-invalid': fieldState.invalid,
                  })}
                />
              )}
            />
          </div>
          <Button disabled={loadingSubmit} label="Update" type="submit" />
        </div>
      </form>
    </div>
  );
};

export default TicketDetailPage;
