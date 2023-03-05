import { VendorPayload } from "./Vendor-dto";
import { CustomerPayload } from "./customer-dto";

export type AuthPayload = VendorPayload | CustomerPayload;
