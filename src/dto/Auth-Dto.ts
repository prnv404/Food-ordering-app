import { VandorPayload } from "./Vendor-dto";
import { CustomerPayload } from "./customer-dto";

export type AuthPayload = VandorPayload | CustomerPayload;
