from enum import Enum
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional
import json


class TransactionType(Enum):
    IN = "IN"
    OUT = "OUT"


@dataclass
class TransactionRequest:
    transaction_type: TransactionType
    employee_uuid: str
    patient_uuid: str
    pyxis_uuid: str
    medicine_id: str
    quantity: int
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    validation_video_path: Optional[str] = None
    open_at: Optional[str] = None
    finished_at: Optional[str] = None

    def open(self):
        self.open_at = datetime.now().isoformat()

    def finish(self):
        self.finished_at = datetime.now().isoformat()

    def set_validation_video_path(self, path: str):
        self.validation_video_path = path

    def is_valid(self):
        if any(
            field is None
            for field in [
                self.employee_uuid,
                self.patient_uuid,
                self.pyxis_uuid,
                self.medicine_id,
                self.quantity,
            ]
        ):
            missing_fields = [
                field_name
                for field_name, field_value in self.__dict__.items()
                if field_value is None
            ]
            raise ValueError(f"Missing fields: {missing_fields}")

        return True

    def to_json(self):
        return json.dumps(
            {
                "transaction_type": self.transaction_type.value,
                "employee_uuid": self.employee_uuid,
                "patient_uuid": self.patient_uuid,
                "pyxis_uuid": self.pyxis_uuid,
                "medicine_id": self.medicine_id,
                "quantity": self.quantity,
                "created_at": self.created_at,
                "validation_video_path": self.validation_video_path,
                "open_at": self.open_at,
                "finished_at": self.finished_at,
            }
        )


class TransactionRequestBuilder:
    def __init__(self):
        self.transaction_type = None
        self.employee_uuid = None
        self.patient_uuid = None
        self.medicine_id = None
        self.pyxis_uuid = None
        self.quantity = None

    def with_type(self, transaction_type: TransactionType):
        self.transaction_type = transaction_type
        return self

    def with_employee_uuid(self, employee_uuid: str):
        self.employee_uuid = employee_uuid
        return self

    def with_patient_uuid(self, patient_uuid: str):
        self.patient_uuid = patient_uuid
        return self

    def with_medicine_id(self, medicine_id: str):
        self.medicine_id = medicine_id
        return self

    def with_pyxis_uuid(self, pyxis_uuid: str):
        self.pyxis_uuid = pyxis_uuid
        return self

    def with_quantity(self, quantity: int):
        self.quantity = quantity
        return self

    def build(self):
        return TransactionRequest(
            self.transaction_type,
            self.employee_uuid,
            self.patient_uuid,
            self.pyxis_uuid,
            self.medicine_id,
            self.quantity,
        )


if __name__ == "__main__":
    builder = TransactionRequestBuilder()
    transaction_request = (
        builder.with_type(TransactionType.OUT)
        .with_employee_uuid("employee_123")
        .with_patient_uuid("patient_456")
        .with_pyxis_uuid("pyxis_789")
        .with_medicine_id("med_789")
        .with_quantity(5)
        .build()
    )

    transaction_request.open()
    transaction_request.finish()
    transaction_request.set_validation_video_path("path/to/video")

    print(transaction_request)
    print(transaction_request.is_valid())
    print(transaction_request.to_json())
