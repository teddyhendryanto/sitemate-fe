// import { useLogin } from "@/hooks/use-login";
import { ROUTE } from "@/pages/common/constant";
import { AuthResponse } from "@/pages/common/interfaces/auth.interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup
  .object({
    email: yup.string().email(),
    password: yup.string(),
  })
  .required();

export type LoginInput = yup.InferType<typeof schema>;

const LoginPage = () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const defaultValues = {
    email: "",
    password: "",
  };

  const methods = useForm<LoginInput>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { handleSubmit, control } = methods;
  const [loading, setLoading] = useState(false);
  const [loginResponse, setLoginResponse] = useState<AuthResponse | null>(null);

  const onSubmitHandler: SubmitHandler<LoginInput> = async (formData) => {
    setLoginError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const result: AuthResponse = await response.json();

      if (result) {
        setLoginResponse(result);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setLoginError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loginResponse) {
      router.push(ROUTE.TICKET);
    }
  }, [loginResponse]);

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
      <div className="flex flex-column gap-3">
        <div className="w-full flex flex-column align-items-center justify-content-center gap-3 py-5">
          <div className="flex flex-wrap justify-content-center align-items-center gap-2">
            <label className="w-6rem">Email</label>
            <Controller
              name="email"
              control={control}
              rules={{ required: "Email is required." }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  autoFocus
                  required
                  type="email"
                  className={classNames({
                    "p-invalid": fieldState.invalid,
                    "w-12rem": true,
                  })}
                />
              )}
            />
          </div>
          <div className="flex flex-wrap justify-content-center align-items-center gap-2">
            <label className="w-6rem">Password</label>
            <Controller
              name="password"
              control={control}
              rules={{ required: "Password is required." }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  required
                  type="password"
                  className={classNames({
                    "p-invalid": fieldState.invalid,
                    "w-12rem": true,
                  })}
                />
              )}
            />
          </div>
          <Button
            type="submit"
            label="Login"
            className="w-10rem mx-auto"
            disabled={loading}
          >
            {loading ? "Logging in..." : ""}
          </Button>
          {loginError && <p style={{ color: "red" }}>{loginError}</p>}
          <div className="flex flex-column gap-0">
            <p>email: test@sitemate.com</p>
            <p>password: 123456</p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default LoginPage;
