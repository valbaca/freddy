import { parse } from "./index";

test.each([
  ["{}", {}],
  [`"asdf"`, "asdf"],
  ["[]", []],
  ["true", true],
  ["false", false],
  ["null", null],
  ["123", 123],
  [`{"foo":"bar"}`, { foo: "bar" }],
  [`{"foo":123}`, { foo: 123 }],
  [`{"foo":"bar","a":"A"}`, { foo: "bar", a: "A" }],
  [`{"foo":true}`, { foo: true }],
  [`1e10`, 1e10],
] as [string, any][])("%p => %p", (str: string, exp: any) => {
  const got = parse(str);
  expect(got).toStrictEqual(exp);
  const official = JSON.parse(str);
  expect(got).toStrictEqual(official);
});
