import { yupResolver } from '@hookform/resolvers/yup';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { ROUTE } from '../../common/constant';
import { useCurrentUser } from '../../hooks/use-current-user';

const schema = yup
  .object({
    title: yup.string(),
    description: yup.string(),
  })
  .required();

export type CreateTicketInput = yup.InferType<typeof schema>;

const TicketCreatePage: NextPage = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<CreateTicketInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmitHandler: SubmitHandler<CreateTicketInput> = async (formData) => {
    setLoadingSubmit(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentUser?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      if (!response.ok) throw new Error('Failed to create ticket');

      setSuccess(true);

      setTimeout(() => {
        router.push(ROUTE.TICKET);
      }, 2000);
    } catch (err: unknown) {
      setSuccess(false);
      if (err instanceof Error) setError(err?.message || 'Error create ticket');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="p-fluid">
      <h2>Create Ticket</h2>
      {success && <Message severity="success" text="Ticket created" />}
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
          <Button disabled={loadingSubmit} label="Submit" type="submit" />
        </div>
      </form>
    </div>
  );
};

export default TicketCreatePage;
