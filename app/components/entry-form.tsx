import { useFetcher } from "@remix-run/react"
import { format } from "date-fns";
import { useEffect, useRef } from "react";
import type { Entry } from "~/db/schema.server";

export default function EntryForm({ entry }: { entry?: Entry }) {
  const fetcher = useFetcher();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (fetcher.data === "undefined" && fetcher.state === "idle" && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [fetcher.state, fetcher.data]);
  return (
    <fetcher.Form method="post" className="mt-2">
      <p className="italic">Create an entry</p>
      <fieldset disabled={fetcher.state !== "idle"} className="disabled:opacity-75">
        <div className="mt-4">
          <input defaultValue={entry?.date ? format(new Date(entry.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")} type="date" name="date" className="text-gray-700" />
        </div>
        <div className="space-x-6 mt-4">
          {
            [
              { label: "Work", value: "work" },
              { label: "Learning", value: "learning" },
              { label: "Interesting Thing", value: "interesting-thing" }
            ].map((option) => (
              <label key={option.value}>
                <input
                  defaultChecked={option.value === (entry?.category ?? "work")}
                  className="mr-1"
                  type="radio"
                  name="category"
                  value={option.value}
                />
                {option.label}
              </label>

            ))
          }
        </div>
        <div className="mt-4">
          <textarea
            ref={textareaRef}
            name="description"
            className="width-full text-gray-700"
            placeholder="Write your entry"
            defaultValue={entry?.description}
          ></textarea>
        </div>
        <div className="mt-1 text-right">
          <button type="submit" className="px-4 py-1 bg-blue-500 text-white font-medium">
          {fetcher.state !== "idle" ? "Saving..." : "Save"}
          </button>
        </div>
      </fieldset>
    </fetcher.Form>
  )
}
