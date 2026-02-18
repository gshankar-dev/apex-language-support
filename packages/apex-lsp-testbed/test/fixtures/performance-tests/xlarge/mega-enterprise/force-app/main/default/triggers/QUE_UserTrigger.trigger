trigger QUE_UserTrigger on User (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    QUE_BaseService_411.ServiceConfig config =
        new QUE_BaseService_411.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            QUE_Domain_418 domain =
                new QUE_Domain_418();
            QUE_Domain_418.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (QUE_Domain_418.ValidationError err : validation.errors) {
                    if (err.severity == QUE_Domain_418.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        QUE_RecordService_413 service =
            new QUE_RecordService_413();
        QUE_BaseService_411.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'QUE trigger error: ' + error);
            }
        }
    }
}
