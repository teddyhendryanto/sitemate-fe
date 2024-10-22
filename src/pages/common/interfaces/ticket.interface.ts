export type Ticket = {
  id: number;
  userId: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ListTicketResponse = Ticket[];

export type DetailTicketResponse = Ticket;

export type UpdateTicketResponse = Ticket;

export type CreateTicketResponse = Ticket;

export type DeleteTicketResponse = Ticket;
