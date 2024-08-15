import {UserState} from "@/types/users"
import {User} from "shared"

export type Context = {
  state: UserState,
  selection: User | null
}
