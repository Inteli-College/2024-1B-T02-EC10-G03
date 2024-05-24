enum EmployeeRole {
	NURSE = 'NURSE',
	PHARMACIST = 'PHARMACIST',
	IT = 'IT',
	ADMIN = 'ADMIN',
	COMMONER = 'COMMONER',
}

enum TransactionType {
	IN = 'IN',
	OUT = 'OUT',
}

enum ValidationStatus {
	SUSPECT = 'SUSPECT',
	NORMAL = 'NORMAL',
	UNVERIFIED = 'UNVERIFIED',
}

enum LogLevel {
	DEBUG = 'DEBUG',
	INFO = 'INFO',
	WARNING = 'WARNING',
	ERROR = 'ERROR',
}

enum LogEvent {
	PYXIS = 'PYXIS',
	BACKEND = 'BACKEND',
	DATABASE = 'DATABASE',
	TRANSACTION = 'TRANSACTION',
	INVENTORY = 'INVENTORY',
	EMPLOYEE = 'EMPLOYEE',
	PATIENT = 'PATIENT',
	MEDICINE = 'MEDICINE',
	VALIDATION = 'VALIDATION',
}

enum PyxisReportType {
	DATA_INCONSISTENCY = 'DATA_INCONSISTENCY',
	NEEDS_REFILL = 'NEEDS_REFILL',
	TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
	OTHER = 'OTHER',
}

enum ReportStatus {
	SENT = 'SENT',
	RECEIVED = 'RECEIVED',
	PENDING = 'PENDING',
	FINISHED = 'FINISHED',
}

enum PatientReportType {
	NOT_CONSUMED = 'NOT_CONSUMED',
	QUANTITY_MISMATCH = 'QUANTITY_MISMATCH',
	OTHER = 'OTHER',
}

interface Patient {
	uuid: string;
	name: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
	Transaction: Transaction[];
	PatientReport: PatientReport[];
}

interface Employee {
	uuid: string;
	role: EmployeeRole;
	name: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
	Transaction: Transaction[];
	OverriddenTransaction: OverriddenTransaction[];
	PyxisReport: PyxisReport[];
}

interface MedicineName {
	name: string;
	createdAt: Date;
	Medicine: Medicine[];
}

interface Medicine {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	Transaction: Transaction[];
	Inventory: Inventory[];
	MedicineNames: MedicineName[];
	PyxisReport: PyxisReport[];
}

interface Transaction {
	uuid: string;
	type: TransactionType;
	employee: Employee;
	employeeUuid: string;
	patient: Patient;
	patientUuid: string;
	medicine: Medicine;
	medicineId: string;
	pyxis: Pyxis;
	pyxisUuid: string;
	quantity: number;
	validation?: Validation;
	validationUuid?: string;
	createdAt: Date;
	PatientReport: PatientReport[];
}

interface OverriddenTransaction {
	uuid: string;
	employee: Employee;
	employeeUuid: string;
	validation: Validation;
	validationUuid: string;
	overrideReason: string;
	createdAt: Date;
}

interface Validation {
	uuid: string;
	openTime: number;
	override: boolean;
	supposedQuantity: number;
	patientAcceptance: boolean;
	createdAt: Date;
	status: ValidationStatus;
	Transaction: Transaction[];
	OverriddenTransaction: OverriddenTransaction[];
}

interface Pyxis {
	uuid: string;
	floor: number;
	block: string;
	extra_data: any;
	createdAt: Date;
	Inventory: Inventory[];
	PyxisReport: PyxisReport[];
	Transaction: Transaction[];
}

interface Inventory {
	medicine: Medicine;
	medicineId: string;
	pyxis: Pyxis;
	pyxisUuid: string;
	quantity: number;
	createdAt: Date;
	updatedAt: Date;
}

interface Log {
	cuid: string;
	level: LogLevel;
	event: LogEvent;
	data: any;
	createdAt: Date;
}

interface PyxisReport {
	cuid: string;
	pyxis: Pyxis;
	pyxisUuid: string;
	employee: Employee;
	employeeUuid: string;
	medicine: Medicine;
	medicineId: string;
	type: PyxisReportType;
	status: ReportStatus;
	additionalInfo: any;
	observation: string;
	urgency: boolean;
	createdAt: Date;
}

interface PatientReport {
	cuid: string;
	patient: Patient;
	patientUuid: string;
	transaction: Transaction;
	transactionUuid: string;
	status: ReportStatus;
	type: PatientReportType;
	observation: string;
	createdAt: Date;
}

export type {
	Patient,
	Employee,
	MedicineName,
	Medicine,
	Transaction,
	OverriddenTransaction,
	Validation,
	Pyxis,
	Inventory,
	Log,
	PyxisReport,
	PatientReport,
	EmployeeRole,
	TransactionType,
	ValidationStatus,
	LogLevel,
	LogEvent,
	PyxisReportType,
	ReportStatus,
	PatientReportType,
};
