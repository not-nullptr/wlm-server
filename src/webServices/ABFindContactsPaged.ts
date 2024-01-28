import { Request, Response } from "express";
import { sleep } from "../util";

export default async function ABFindContactsPaged(req: Request, res: Response) {
	return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
	<soap:Header>
		<ServiceHeader xmlns="http://www.msn.com/webservices/AddressBook">
			<Version>15.01.1408.0000</Version>
			<CacheKey>12r1:gpxK-8-TUlxayAla2_BoUvHaJNr_fsHw6MuIKP-yWTZbJlGbSJlnjMRCef13DpE-0N6BcF3hba1_WdINAmUEGWk4qlORjm-JhZyw2q4EjAR4yNQaXlY6Q4zr8WDd8i8uJsxUxIOAMnxQvNtB4DbhwLlj2yvGsRB0mzIJeiUmpkCqU2erEkQbND1V0f8KHEDNgoCVUOvHGAKPQE7w7E58odfJmFREFj4GJsKRXw</CacheKey>
			<CacheKeyChanged>true</CacheKeyChanged>
			<PreferredHostName>localhost</PreferredHostName>
			<SessionId>12cf891e-0629-4155-8c59-45d87e23bf90</SessionId>
		</ServiceHeader>
	</soap:Header>
	<soap:Body>
		<ABFindContactsPagedResponse xmlns="http://www.msn.com/webservices/AddressBook">
			<ABFindContactsPagedResult>
                <Groups></Groups>
                <Contacts></Contacts>
			</ABFindContactsPagedResult>
		</ABFindContactsPagedResponse>
	</soap:Body>
</soap:Envelope>
    `);
}
