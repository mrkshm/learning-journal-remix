import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { ClientLoaderFunctionArgs, Link, useLoaderData } from "@remix-run/react";
import { format, startOfWeek, parseISO } from "date-fns"
import { z } from "zod";
import { getSession } from "~/session";
import { db } from "~/db/config.server";
import { type Entry, entries } from "~/db/schema.server";
import EntryForm from "~/components/entry-form";

export const entryZodSchema = z.object({
  category: z.string().default('work'),
  description: z.string(),
  date: z.string().default(() => new Date().toISOString()),
});

export async function loader({ request }: ClientLoaderFunctionArgs) {
  let session = await getSession(request.headers.get("Cookie"));
  const data = db.select().from(entries).all();
  const entriesByWeek = new Map<string, { work: Entry[], learnings: Entry[], interestingThings: Entry[] }>();

  data.forEach(entry => {
    const weekStart = startOfWeek(parseISO(entry.date));
    const weekStartString = format(weekStart, "yyyy-MM-dd");

    if (!entriesByWeek.has(weekStartString)) {
      entriesByWeek.set(weekStartString, { work: [], learnings: [], interestingThings: [] });
    }

    let categoryGroup = entriesByWeek.get(weekStartString);
    if (!categoryGroup) {
      categoryGroup = { work: [], learnings: [], interestingThings: [] };
    }

    // Now you can safely use categoryGroup
    switch (entry.category) {
      case "work":
        categoryGroup.work.push(entry);
        break;
      case "learning":
        categoryGroup.learnings.push(entry);
        break;
      case "interesting-thing":
        categoryGroup.interestingThings.push(entry);
        break;
    }
  });

  // Convert the Map to an array of week entries
  const weeks = Array.from(entriesByWeek).map(([dateString, categories]) => ({
    dateString,
    ...categories
  }));

  console.log(JSON.stringify(weeks));
  return { session: session.data, weeks };
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.isAdmin) throw new Response("Not authorized", { status: 401 })

  try {
    const formData = await request.formData();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const data = Object.fromEntries(formData);
    const parsedData = entryZodSchema.parse(data);
    const insertData = {
      category: parsedData.category,
      date: format(parsedData.date, "yyyy-MM-dd"),
      description: parsedData.description,
    };
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const newEntry = await db.insert(entries)
      .values(insertData)
      .returning();
    return newEntry;
  } catch (error) {
    console.error(error);
    return null;
  }

}
export const meta: MetaFunction = () => {
  return [
    { title: "Learnings and Doings" },
    { name: "description", content: "A place to note what you are doing" },
  ];
};

export default function Index() {
  const { weeks, session } = useLoaderData<typeof loader>();

  return (
    <div>
      {session.isAdmin &&
        <div className="my-8 border p-2">
          <EntryForm />
        </div>}

      <div className="space-y-4">
        {weeks.map((week) => (
          <div className="mt-8" key={week.dateString}>
            <h3 className="font-bold">Week of {format((parseISO(week.dateString)), "MMMM do")}</h3>
            <div className="mt-3 space-y-4">
              {week.work.length > 0 && (
                <div>
                  <p>Work</p>
                  <ul className="ml-8 list-disc">
                    {week.work.map((work) => (
                      <EntryListItem canEdit={session.isAdmin} key={work.id} entry={work} />
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div>
                  <p>Learnings</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((learning) => (
                      <EntryListItem canEdit={session.isAdmin} key={learning.id} entry={learning} />
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThings.length > 0 && (
                <div>
                  <p>Interesting Things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((interestingThing) => (
                      <EntryListItem canEdit={session.isAdmin} key={interestingThing.id} entry={interestingThing} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryListItem({ entry, canEdit }: { entry: Entry, canEdit: boolean }) {
  return (

    <li className="group">
      {entry.description}
      {canEdit &&
        <Link to={`entries/${entry.id}/edit`} className="opacity-0 group-hover:opacity-100 ml-2 text-blue-500">Edit</Link>
      }
    </li>
  )
}
