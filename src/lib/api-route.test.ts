import { describe, expect, it } from "vitest"
import { Prisma } from "@prisma/client"
import {
  isPrismaUniqueViolation,
  parsePagination,
  paginationMeta,
} from "./api-route"

describe("parsePagination", () => {
  it("defaults to page 1 and limit 20", () => {
    const params = new URLSearchParams()
    expect(parsePagination(params)).toEqual({ page: 1, limit: 20, skip: 0 })
  })

  it("clamps limit to max 100", () => {
    const params = new URLSearchParams({ page: "2", limit: "500" })
    expect(parsePagination(params)).toEqual({ page: 2, limit: 100, skip: 100 })
  })

  it("falls back on invalid numbers", () => {
    const params = new URLSearchParams({ page: "x", limit: "y" })
    expect(parsePagination(params)).toEqual({ page: 1, limit: 20, skip: 0 })
  })
})

describe("paginationMeta", () => {
  it("computes totalPages", () => {
    expect(paginationMeta(45, 1, 20)).toEqual({
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
    })
  })
})

describe("isPrismaUniqueViolation", () => {
  it("detects P2002", () => {
    const err = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "test",
    })
    expect(isPrismaUniqueViolation(err)).toBe(true)
  })

  it("rejects other errors", () => {
    expect(isPrismaUniqueViolation(new Error("nope"))).toBe(false)
  })
})
