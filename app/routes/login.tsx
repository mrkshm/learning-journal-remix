import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData, type ClientLoaderFunctionArgs } from "@remix-run/react";
import { commitSession, getSession } from "~/session";


export async function action({ request }: ActionFunctionArgs) {
  let formData = await request.formData();
  let { email, password } = Object.fromEntries(formData);

  if (email === "s@s.com" && password === "pw") {
    let session = await getSession();
    session.set("isAdmin", true);

    return redirect("/", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } else {
    return null;
  }
}

export async function loader({ request }: ClientLoaderFunctionArgs) {
  let session = await getSession(request.headers.get("Cookie"));
  return session.data;
}
export default function Login() {
  let data = useLoaderData<typeof loader>();
  return (
    <div className="mt-8 text-gray-900">
      {data?.isAdmin ? (<p className="text-white">You are logged in.</p>) : (
        <Form method="post">
          <label>
            <input type="email" name="email" required placeholder="email" />
          </label>
          <label>
            <input type="password" name="password" required placeholder="password" />
          </label>
          <button type="submit">Log In</button>
        </Form>
      )}
    </div>
  )
}
