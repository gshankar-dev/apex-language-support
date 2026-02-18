trigger QRY_GroupTrigger on Group (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    QRY_BaseService_671.ServiceConfig config =
        new QRY_BaseService_671.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            QRY_Domain_678 domain =
                new QRY_Domain_678();
            QRY_Domain_678.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (QRY_Domain_678.ValidationError err : validation.errors) {
                    if (err.severity == QRY_Domain_678.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        QRY_RecordService_673 service =
            new QRY_RecordService_673();
        QRY_BaseService_671.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'QRY trigger error: ' + error);
            }
        }
    }
}
