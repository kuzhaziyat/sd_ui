import { map } from "@/helpers/tasksMap";

declare global {
  namespace iStore {
    interface AppConfig {
      errorHandler?: (err: unknown, instance: ComponentPublicInstance | null, info: string) => void;
    }
    interface PersData {
      personal: {
        personalId: number;
        lastName: string;
        firstName: string;
        surName: string;
        department: { name: string; id: number | undefined };
        position: { name: string; id: number | undefined };
        log: iLog[];
        editable: boolean;
      };
      contacts: {
        personalId: number;
        email: string;
        phone: string;
        mobile: string;
        editable: boolean;
      };
      user: {
        uid: string;
        personalId: number;
        email: string;
        roles: number[];
        editable: boolean;
      };
      status: string | undefined;
    }
    interface RootState {
      titles: {
        title: string;
      };
      app: {
        mobileMenu: boolean;
        returnMobile: boolean;
        mobile: boolean;
        stateTask: string;
      };
      user: User;
      tasks: Tasks;
      events: {
        messages: iEvents[];
      };
      componentLoader: { status: boolean };
      personal: {
        personalList: Personal[];
        id: number;
        messages: number;
        records: { id: number; type: string }[];
        departments: Departments[];
        positions: Positions[];
        roles: {
          id: number;
          name: string;
          descriptions: string;
        }[];
      };
      sockets: { messages: SocketsMessages[] };
    }
    interface Departments {
      id: number;
      orgId: number;
      headId: number;
      controlId: number;
      name: string;
      control: { firstName: string; lastName: string; position: { name: string }; name: string; surName: string };
      head: { firstName: string; lastName: string; position: { name: string }; name: string; surName: string };
    }
    interface Positions {
      id: number;
      orgId: number;
      depId: number;
      name: string;
      shortName: string;
    }

    interface SocketsMessages {
      senderId: number;
      reciverId: number;
      message: string;
      files: { url: string; filename: string; size: number; mimetype: string }[];
      timestamp: string;
      delivered: boolean;
      readed: boolean;
      id: number;
    }

    interface iEvents {
      message: string;
      type: string;
      url?: string;
      id?: number;
    }

    interface iNotifications {
      id: number;
      eventTypeId: number;
      level: number;
      link: string;
      message: string;
      personalId: number;
      orgId: number;
    }

    interface User {
      info: {
        id: number;
        organization: {
          fullName: string;
          shortName: string;
          inn: string;
          kpp: string;
          legalAdress: string;
        };
        roles: { name: string }[];
        isHead: boolean;
        isAdmin: boolean;
        isVice: boolean;
        isManager: boolean;
        isDepHead: boolean;
        person?: {
          fullName: string;
          shortName: string;
          position: string;
          phone: string;
          email: string;
        };
      };
    }
    interface Tasks {
      allTasks: Task[];
      counts: Counts[];
      selected: number;
      taskOfSelectedDay: SelectedDay;
      requiredData: {
        inner: RequiredData[];
        orgs: RequiredData[];
      };
      task: Task | undefined;
    }

    interface RequiredData {
      id: number;
      name: string;
      headId: number;
      department: string;
    }

    interface SelectedDay {
      day: string;
      tasks: Task[];
    }

    interface Task {
      id: number;
      number: number;
      approved: boolean;
      createdAt: string;
      updatedAt: string;
      info: TaskInfo;
      isReturned: boolean;
      organization: {
        shortName: state;
        position: {
          name: string;
        };
      };
      creator: {
        id: number;
        firstName: string;
        lastName: string;
        surName: string;
        organization: {
          fullName: state;
          shortName: string;
        };
        department: {
          name: state;
        };
        position: {
          name: string;
          shortName: string;
        };
      };
      executorOrg?: { shortName: string }[];
      executor: {
        id: number;
        firstName: string;
        lastName: string;
        surName: string;
        organization: {
          fullName: state;
          shortName: string;
        };
        department: {
          name: state;
        };
        position: {
          name: string;
          shortName: string;
        };
      };
      control: {
        id: number;
        firstName: string;
        lastName: string;
        surName: string;
        organization: {
          fullName: state;
          shortName: string;
        };
        department: {
          name: state;
        };
        position: {
          name: string;
          shortName: string;
        };
      };
      priority: {
        id: number;
        type: string;
      };
      department: {
        controlId: number;
        headId: number;
        id: number;
        name: string;
        orgId: number;
      };
      soExecutors: {
        personalId: number;
        personal: {
          firstName: string;
          lastName: string;
          surName: string;
          organization: {
            fullName: state;
            shortName: string;
          };
          department: {
            name: state;
          };
          position: {
            name: string;
            shortName: string;
          };
        };
      }[];
    }
    interface Counts {
      title: string;
      count: number;
      icon: string;
      link: string;
      priority: number;
    }
    interface TaskInfo {
      id: number;
      title: string;
      description: string;
      deadLine: string;
      files: { filename: string; mimetype: string; size: number; url: string }[];
      log: { type: string; senderId: number | null; timestamp: string; message: string; files: { filename: string; mimetype: string; size: number; url: string }[] }[];
      status: boolean | null;
      createdAt: string;
      updatedAt: string;
    }
    interface Personal {
      id: number;
      firstName: string;
      lastName: string;
      surName: string;
      class: string;
      contacts: {
        email: string;
        mobile: string;
        telegram: string;
        phone: string;
      };
      log: iLog[];
      user: {
        uid: string;
        email: string;
        avatar: string | null;
        role: {
          id: number;
          descriptions: string | undefined;
          name: string;
        }[];
      };
      department: {
        id: number;
        headId: number;
        controlId: number;
        name: string;
      };
      position: {
        id: number;
        name: string;
      };
      messages: SocketsMessages[];
      online: boolean;
      lastSeen: string;
    }
    interface iLog {
      type: number;
      timeStart: string;
      duration: number | null;
      timestamp: string;
      comment: string | null;
      files: { url: string; filename: string; size: number; mimetype: string }[];
    }
  }
  namespace CreateTasks {
    interface TaskPayload {
      controlId: number;
      priorityId: number;
      title: string;
      files: [{ url: string; name: string }];
      log: Logs;
      executororg?: { orgId: number }[];
      description?: string;
      departmentId?: number;
      executorId?: number;
      parentTaskId?: number;
      parentproposalId?: number;
      childproposalId?: number;
      soexecutor?: { personalId: number }[];
      status?: string;
      deadLine?: string;
    }
    interface Logs {
      comments: {
        count: number;
        messages: { sender: string; id: number; message: string }[];
      };
      log: {
        timestamp: string;
        message: string;
      }[];
    }
  }
}

export {};
