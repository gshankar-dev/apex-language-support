trigger IDX_GroupTrigger on Group (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    IDX_BaseService_331.ServiceConfig config =
        new IDX_BaseService_331.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            IDX_Domain_338 domain =
                new IDX_Domain_338();
            IDX_Domain_338.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (IDX_Domain_338.ValidationError err : validation.errors) {
                    if (err.severity == IDX_Domain_338.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        IDX_RecordService_333 service =
            new IDX_RecordService_333();
        IDX_BaseService_331.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'IDX trigger error: ' + error);
            }
        }
    }
}
