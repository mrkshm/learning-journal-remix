import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {z} from "zod";
import {format} from "date-fns";
import { db } from "~/db/config.server";
import { entries } from "~/db/schema.server";
import { useEffect, useRef } from "react";

const entryZodSchema = z.object({
  category: z.string().default('work'),
  description: z.string(),
  date: z.string().default(() => new Date().toISOString()), 
});

export async function loader() {
  const data = await db.select().from(entries).all();
  return data;
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const data = Object.fromEntries(formData);
    const parsedData = entryZodSchema.parse(data);
    const insertData = {
      category: parsedData.category,
      date: parsedData.date,
      description: parsedData.description,
    };

    const newEntry = await db.insert(entries)
      .values(insertData)
      .run();
      return newEntry;
  } catch (error) {
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
  const entries = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.focus();
    }
  }, [fetcher.state]);

  fetcher.state;

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-4xl text-white">Work journal</h1>
      <p className="mt-3 text-xl text-gray-400">
        Doings and learnings. Updated weekly.
      </p>

      <p>No entries. Write your first journal entry.</p>
      <div className="my-8 border p-2">
        <fetcher.Form method="post">
          <p className="italic">Create an entry</p>
          <fieldset className="disabled:opacity-80" disabled={fetcher.state === "submitting"}>
            <div className="mt-4">
              <input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} name="date" required className="text-gray-700" />

            </div>
            <div className="space-x-6 mt-4">
              <label>
                <input
                  required
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
                required
                name="description"
                className="width-full text-gray-700"
                placeholder="Write your entry"
              ></textarea>
            </div>
            <div className="mt-1 text-right">
              <button className="px-4 py-1 bg-blue-500 text-white font-medium">
                {fetcher.state === "submitting" ? "...Savind" : "Save"}
              </button>
            </div>
          </fieldset>
        </fetcher.Form>
      </div>

      <div>
        {entries.map((entry) => (
          <p key={entry.id}>{entry.date} - {entry.description}</p>
        ))
        }
      </div>

      {/* <div className="mt-8"> */}
      {/*   <ul> */}
      {/*     <li> */}
      {/*       <p> */}
      {/*         Week of Feb 2<sup>nd</sup>, 2023 */}
      {/*       </p> */}
      {/**/}
      {/*       <div className="mt-4 space-y-4"> */}
      {/*         <div> */}
      {/*           <p>Work:</p> */}
      {/*           <ul className="ml-6 list-disc"> */}
      {/*             <li>First thing</li> */}
      {/*           </ul> */}
      {/*         </div> */}
      {/*         <div> */}
      {/*           <p>Learnings:</p> */}
      {/*           <ul className="ml-6 list-disc"> */}
      {/*             <li>First learning</li> */}
      {/*             <li>Second learning</li> */}
      {/*           </ul> */}
      {/*         </div> */}
      {/*         <div> */}
      {/*           <p>Interesting things:</p> */}
      {/*           <ul className="ml-6 list-disc"> */}
      {/*             <li>Something cool!</li> */}
      {/*           </ul> */}
      {/*         </div> */}
      {/*       </div> */}
      {/*     </li> */}
      {/*   </ul> */}
      {/* </div> */}
    </div>
  );
}
