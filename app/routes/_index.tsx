import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { format, startOfWeek, parseISO } from "date-fns"
import { z } from "zod";
import { db } from "~/db/config.server";
import { type Entry, entries } from "~/db/schema.server";

const entryZodSchema = z.object({
  category: z.string().default('work'),
  description: z.string().optional(),
  date: z.string().default(() => new Date().toISOString()),
});

export async function loader() {
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
  return weeks;
}

async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
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
  const fetcher = useFetcher();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const weeks = useLoaderData<typeof loader>();
  console.log("data is", weeks)

  useEffect(() => {
    if (fetcher.state === "idle" && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [fetcher.state]);
  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-4xl text-white">Work journal</h1>
      <p className="mt-3 text-xl text-gray-400">
        Doings and learnings. Updated weekly.
      </p>

      <p>No entries. Write your first journal entry.</p>
      <div className="my-8 border p-2">
        <fetcher.Form method="post" className="mt-2">
          <p className="italic">Create an entry</p>
          <fieldset disabled={fetcher.state === "submitting"} className="disabled:opacity-75">
            <div className="mt-4">
              <input defaultValue={format(new Date(), "yyyy-MM-dd")} type="date" name="date" className="text-gray-700" />
            </div>
            <div className="space-x-6 mt-4">
              <label>
                <input
                  defaultChecked
                  className="mr-1"
                  type="radio"
                  name="category"
                  value="work"
                />
                Work
              </label>
              <label>
                <input
                  className="mr-1"
                  type="radio"
                  name="category"
                  value="learning"
                />
                Learning
              </label>
              <label>
                <input
                  className="mr-1"
                  type="radio"
                  name="category"
                  value="interesting-thing"
                />
                Interesting Thing
              </label>
            </div>
            <div className="mt-4">
              <textarea
                ref={textareaRef}
                name="description"
                className="width-full text-gray-700"
                placeholder="Write your entry"
              ></textarea>
            </div>
            <div className="mt-1 text-right">
              <button type="submit" className="px-4 py-1 bg-blue-500 text-white font-medium">
                Submit
              </button>
            </div>
          </fieldset>
        </fetcher.Form>
      </div>

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
                      <li key={work.id}>{work.description}</li>
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div>
                  <p>Learnings</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((learning) => (
                      <li key={learning.id}>{learning.description}</li>
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThings.length > 0 && (
                <div>
                  <p>Interesting Things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((interestingThing) => (
                      <li key={interestingThing.id}>{interestingThing.description}</li>
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
