import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import {z} from "zod";
import { db } from "~/db/config.server";
import { entries } from "~/db/schema.server";

const entryZodSchema = z.object({
  category: z.string().default('work'),
  title: z.string(), 
  description: z.string().optional(),
  date: z.string().default(() => new Date().toISOString()), 
});

export async function loader() {
  const data = await db.select().from(entries).all();
  console.log(JSON.stringify(data))
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const parsedData = entryZodSchema.parse(data);
  const insertData = {
    title: parsedData.title,
    category: parsedData.category,
    date: parsedData.date,
    ...(parsedData.description && { description: parsedData.description }),
  };

  db.insert(entries)
    .values(insertData)
    .run();
  return redirect("/");
  } catch (error) {
    return null;
  }
  
}
export const meta: MetaFunction = () => {
  return [
    { title: "Learnings and Doings" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-4xl text-white">Work journal</h1>
      <p className="mt-3 text-xl text-gray-400">
        Doings and learnings. Updated weekly.
      </p>

      <p>No entries. Write your first journal entry.</p>
      <div className="my-8 border p-2">
        <Form method="post">
          <p className="italic">Create an entry</p>
          <div>
            <div className="mt-4">
              <input type="date" name="date" className="text-gray-700" />
            </div>
            <div className="space-x-6 mt-4">
              <label>
                <input
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
              <label>
                <input
                  name="title"
                  className="width-full text-gray-700"
                  placeholder="Title"
                />
                Title
              </label>
            </div>
            <div className="mt-4">
              <textarea
                name="description"
                className="width-full text-gray-700"
                placeholder="Write your entry"
              ></textarea>
            </div>
            <div className="mt-1 text-right">
              <button className="px-4 py-1 bg-blue-500 text-white font-medium">
                Submit
              </button>
            </div>
          </div>
        </Form>
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
