import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { db } from "~/db/config.server";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { entryZodSchema } from "./_index";
import { entries } from "~/db/schema.server";
import { Form, useLoaderData } from "@remix-run/react";
import EntryForm from "~/components/entry-form";
import { FormEvent } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
  if (typeof params.entryId !== "string") throw new Response("Not found", { status: 404 });
  const entry = await db.select().from(entries).where(eq(entries.id, +params.entryId));
  if (!entry) throw new Response("Not found", { status: 404 });
  return entry[0];
}

export async function action({ request, params }: ActionFunctionArgs) {

  try {
    const formData = await request.formData();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const { _action, ...data } = Object.fromEntries(formData);

    if (_action === "delete") {
      if (typeof params.entryId !== "string") throw new Response("Not found", { status: 404 });
      await db.delete(entries).where(eq(entries.id, +params.entryId))

      return redirect('/');
    } else {
      const parsedData = entryZodSchema.parse(data);
      const insertData = {
        category: parsedData.category,
        date: format(parsedData.date, "yyyy-MM-dd"),
        description: parsedData.description,
      };
      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (!params.entryId) throw new Response("Not found", { status: 404 });

      await db.update(entries)
        .set(insertData)
        .where(eq(entries.id, +params.entryId))
        .returning();
      return redirect('/');
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default function Page() {
  const entry = useLoaderData<typeof loader>();

  function handleSubmit(e: FormEvent) {
    if (!confirm("Are you sure about this?")) e.preventDefault();
  }
  return <div>
    <p>Editing entry {entry.id}</p>
    <div className="mt-8">
      <EntryForm entry={entry} />
    </div>

    <div className="mt-8">
      <Form method="post" onSubmit={handleSubmit}>
        <button name="_action" value="delete" type="submit" className="text-gray-500 underline">Delete this entry...</button>
      </Form>
    </div>
  </div>
}
